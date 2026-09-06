import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import worldTopo from 'world-atlas/countries-110m.json';
import { SUPPORTED_COUNTRIES, type SupportedCountry } from '../../../data/supportedCountries';
import { ISO_NUMERIC_TO_ALPHA2 } from '../../../data/isoNumericToAlpha2';

const WIDTH = 960;
const HEIGHT = 460;

// Ville repère par pays (coordonnées [lon, lat]) : le centroïde géométrique est
// piégeux (la France « pèse » jusqu'en Guyane) — un point métropole est plus juste.
interface MarkerConfig {
  /** [longitude, latitude] d'une ville repère. */
  coords: [number, number];
  /** Décalage du libellé, pour que France et Suisse ne se chevauchent pas. */
  label: { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' };
}

const MARKER_CONFIG: Record<string, MarkerConfig> = {
  // Paris — libellé au-dessus à gauche, la Suisse occupant le côté droit.
  FR: { coords: [2.35, 48.86], label: { dx: -10, dy: -14, anchor: 'end' } },
  US: { coords: [-74.0, 40.71], label: { dx: 10, dy: -12, anchor: 'start' } },
  JP: { coords: [139.69, 35.68], label: { dx: 10, dy: 4, anchor: 'start' } },
  // Berne plutôt que Genève : à cette échelle (topojson 110m) Genève, enclavée
  // à l'extrême ouest, tombe hors du polygone suisse — l'épingle se plantait en
  // France. Libellé décalé vers le bas droite pour dégager la France.
  CH: { coords: [7.45, 46.95], label: { dx: 9, dy: 12, anchor: 'start' } },
};

/**
 * Morceaux d'un pays qui ne sont PAS le territoire principal. Les données
 * cartographiques ne nomment que le pays (la Guyane fait partie de la feature
 * « France », même code ISO 250) : sans ce repérage, survoler la Guyane
 * annonçait « France — disponible », alors que nos villes et nos coûts de la
 * vie sont métropolitains.
 * Zones en [lonMin, latMin, lonMax, latMax].
 */
interface Territory {
  name: string;
  bbox: [number, number, number, number];
}

const TERRITORIES: Record<string, Territory[]> = {
  FR: [{ name: 'Guyane', bbox: [-55, 2, -51, 6] }],
};

/** Territoire non couvert situé à ces coordonnées, s'il y en a un. */
export function territoryAt(
  countryCode: string,
  lon: number,
  lat: number,
): string | undefined {
  return TERRITORIES[countryCode]?.find(
    (z) => lon >= z.bbox[0] && lon <= z.bbox[2] && lat >= z.bbox[1] && lat <= z.bbox[3],
  )?.name;
}

interface HoverState {
  x: number;
  y: number;
  name: string;
  supported?: SupportedCountry;
  /** Territoire non couvert survolé (ex. Guyane), le cas échéant. */
  territory?: string;
}

type CountryFeature = Feature<Geometry, { name: string }> & { id?: string | number };

/**
 * Carte du monde interactive : les destinations couvertes par SkyWalk ressortent
 * en teal (halo + marqueur pulsant), le reste du monde attend son tour en gris.
 * Clic sur un pays disponible → sa page destination.
 */
export default function WorldMap() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Le fond de carte ne fournit que des noms anglais. Intl.DisplayNames les
  // traduit dans la langue de l'interface, mais n'accepte que les codes
  // alpha-2 — d'où la table de conversion depuis le code numérique du fond.
  const countryName = useMemo(() => {
    let display: Intl.DisplayNames | null = null;
    try {
      display = new Intl.DisplayNames([i18n.language], { type: 'region' });
    } catch {
      display = null;
    }
    return (numericId: string, fallback: string): string => {
      const alpha2 = ISO_NUMERIC_TO_ALPHA2[numericId];
      if (!alpha2 || !display) return fallback;
      try {
        return display.of(alpha2) ?? fallback;
      } catch {
        // Territoires sans code ISO officiel (Kosovo, Somaliland…)
        return fallback;
      }
    };
  }, [i18n.language]);
  const [hover, setHover] = useState<HoverState | null>(null);

  const { countries, projection, pathFor, markers, graticulePath, spherePath } = useMemo(() => {
    const topology = worldTopo as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
    const collection = feature(topology, topology.objects.countries);
    // Antarctique : beaucoup de pixels, zéro expatriation — on l'écarte pour cadrer le reste.
    const countries = (collection.features as CountryFeature[]).filter(
      (f) => String(f.id) !== '010',
    );

    // fitExtent avec une marge NÉGATIVE = zoom : la carte déborde du cadre, ce
    // qui grossit les pays au lieu de les laisser flotter au milieu.
    // 6 % est le maximum sans rogner une destination : au-delà, la queue des
    // Aléoutiennes (États-Unis, à l'extrême ouest) sort du cadre, et un pays
    // colorié coupé se lit comme un bug d'affichage.
    const ZOOM = 0.06;
    const projection = geoNaturalEarth1().fitExtent(
      [
        [-WIDTH * ZOOM, -HEIGHT * ZOOM],
        [WIDTH * (1 + ZOOM), HEIGHT * (1 + ZOOM)],
      ],
      { type: 'FeatureCollection', features: countries } as never,
    );
    const path = geoPath(projection);

    const markers = SUPPORTED_COUNTRIES.flatMap((c) => {
      const config = MARKER_CONFIG[c.code];
      const projected = config ? projection(config.coords) : null;
      return projected
        ? [{ country: c, x: projected[0], y: projected[1], label: config.label }]
        : [];
    });

    return {
      countries,
      projection,
      pathFor: (f: CountryFeature) => path(f) ?? '',
      markers,
      graticulePath: path(geoGraticule10()) ?? '',
      spherePath: path({ type: 'Sphere' }) ?? '',
    };
  }, []);

  const supportedByNumericId = useMemo(() => {
    const map = new Map<string, SupportedCountry>();
    for (const c of SUPPORTED_COUNTRIES) {
      if (c.isoNumeric) map.set(c.isoNumeric, c);
    }
    return map;
  }, []);

  const handleMove = (e: React.MouseEvent, f: CountryFeature) => {
    const svg = (e.currentTarget as SVGPathElement).ownerSVGElement!;
    const rect = svg.parentElement!.getBoundingClientRect();
    const supported = supportedByNumericId.get(String(f.id).padStart(3, '0'));

    // Repasse du pixel écran aux coordonnées géographiques pour savoir QUEL
    // morceau du pays est sous le curseur. Le SVG est mis à l'échelle par CSS :
    // on ramène d'abord la position dans le repère du viewBox.
    let territory: string | undefined;
    const zones = supported ? TERRITORIES[supported.code] : undefined;
    if (zones) {
      const svgRect = svg.getBoundingClientRect();
      const scale = WIDTH / svgRect.width;
      const point: [number, number] = [
        (e.clientX - svgRect.left) * scale,
        (e.clientY - svgRect.top) * scale,
      ];
      const geo = projection.invert?.(point);
      if (geo) territory = territoryAt(supported!.code, geo[0], geo[1]);
    }

    setHover({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      name: countryName(String(f.id).padStart(3, '0'), f.properties?.name ?? ''),
      supported,
      territory,
    });
  };

  return (
    <div className="relative rounded-3xl border border-gray-100 bg-gradient-to-b from-[#5EA3C0]/10 via-white to-white overflow-hidden">
      <div className="px-6 pt-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-gray-900">
          {t('worldMap.title', { defaultValue: 'Où peut-on partir avec SkyWalk ?' })}
        </h2>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5EA3C0]" />
            {t('worldMap.available', { defaultValue: 'Disponible' })} ({SUPPORTED_COUNTRIES.length})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            {t('worldMap.comingSoon', { defaultValue: 'Bientôt' })}
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto block"
        role="img"
        aria-label={t('worldMap.title', { defaultValue: 'Où peut-on partir avec SkyWalk ?' })}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <filter id="country-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#5EA3C0" floodOpacity="0.55" />
          </filter>
        </defs>

        <path d={spherePath} fill="transparent" pointerEvents="none" />
        <path d={graticulePath} fill="none" stroke="#5EA3C0" strokeOpacity="0.08" strokeWidth="0.6" pointerEvents="none" />

        {/* Pays non couverts d'abord, disponibles ensuite (au-dessus, halo net) */}
        {countries
          .filter((f) => !supportedByNumericId.has(String(f.id).padStart(3, '0')))
          .map((f, i) => (
            <path
              // Certaines features du topojson n'ont pas d'id (territoires contestés) :
              // l'index désambiguïse — la liste est statique, c'est sans risque.
              key={`${f.id ?? 'no-id'}-${i}`}
              d={pathFor(f)}
              fill={hover?.name === f.properties?.name ? '#D7DCE2' : '#E8EBEF'}
              stroke="#fff"
              strokeWidth="0.5"
              className="transition-colors duration-150"
              onMouseMove={(e) => handleMove(e, f)}
            />
          ))}

        {countries
          .filter((f) => supportedByNumericId.has(String(f.id).padStart(3, '0')))
          .map((f) => {
            const supported = supportedByNumericId.get(String(f.id).padStart(3, '0'))!;
            const isHovered = hover?.supported?.code === supported.code;
            return (
              <path
                key={String(f.id)}
                d={pathFor(f)}
                fill={isHovered ? '#4891b0' : '#5EA3C0'}
                stroke="#fff"
                strokeWidth="0.8"
                filter="url(#country-glow)"
                className="cursor-pointer transition-colors duration-150"
                onMouseMove={(e) => handleMove(e, f)}
                onClick={() => navigate(`/destinations/${supported.slug}`)}
                data-testid={`map-country-${supported.code}`}
              />
            );
          })}

        {/* Marqueurs des destinations couvertes — décoratifs : pointer-events
            none pour que le clic atteigne le pays en dessous.
            Un point clair cerclé de teal se perdait sur le teal du pays : on
            utilise une épingle sombre à contour blanc, lisible aussi bien sur
            les pays colorés que sur le gris, et on nomme chaque destination
            pour ne plus dépendre du survol. */}
        {markers.map(({ country, x, y, label }) => (
          <g key={country.code} pointerEvents="none">
            <circle cx={x} cy={y} r="7" fill="#fff" opacity="0.5">
              <animate attributeName="r" values="4;12;4" dur="2.6s" repeatCount="indefinite" />
              <animate
                attributeName="opacity"
                values="0.55;0;0.55"
                dur="2.6s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Épingle : pointe posée exactement sur la ville repère. */}
            <path
              d={`M ${x} ${y} c -3.6 -4.6 -5.4 -7 -5.4 -9.4 a 5.4 5.4 0 1 1 10.8 0 c 0 2.4 -1.8 4.8 -5.4 9.4 z`}
              fill="#14425A"
              stroke="#fff"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx={x} cy={y - 9.4} r="2" fill="#fff" />
            {/* Nom de la destination, cerné de blanc pour rester lisible
                quel que soit ce qu'il y a dessous (paint-order). */}
            <text
              x={x + label.dx}
              y={y + label.dy}
              textAnchor={label.anchor}
              fontSize="9.5"
              fontWeight="700"
              fill="#14425A"
              stroke="#fff"
              strokeWidth="2.6"
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              {country.isoNumeric
                ? countryName(country.isoNumeric, country.name)
                : country.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Tooltip suiveur */}
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg"
          style={{ left: hover.x, top: hover.y - 10 }}
        >
          {hover.supported ? (
            <>
              <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                {hover.supported.flag} {hover.name || hover.supported.name}
                {hover.territory && (
                  <span className="font-normal text-gray-500"> — {hover.territory}</span>
                )}
              </p>
              {hover.territory ? (
                <p className="text-[11px] text-gray-400 whitespace-nowrap">
                  {t('worldMap.territoryNoData', {
                    defaultValue: 'Pas encore de données pour ce territoire',
                  })}
                </p>
              ) : (
                <p className="text-[11px] font-medium text-[#5EA3C0] whitespace-nowrap">
                  {t('worldMap.clickToExplore', { defaultValue: 'Disponible — cliquer pour explorer' })}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700 whitespace-nowrap">{hover.name}</p>
              <p className="text-[11px] text-gray-400 whitespace-nowrap">
                {t('worldMap.notYet', { defaultValue: 'Bientôt disponible' })}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
