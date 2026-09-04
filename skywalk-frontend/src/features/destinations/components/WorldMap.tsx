import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';
import worldTopo from 'world-atlas/countries-110m.json';
import { SUPPORTED_COUNTRIES, type SupportedCountry } from '../../../data/supportedCountries';

const WIDTH = 960;
const HEIGHT = 460;

// Ville repère par pays (coordonnées [lon, lat]) : le centroïde géométrique est
// piégeux (la France « pèse » jusqu'en Guyane) — un point métropole est plus juste.
const MARKER_COORDS: Record<string, [number, number]> = {
  FR: [2.35, 48.86], // Paris
  US: [-74.0, 40.71], // New York
  JP: [139.69, 35.68], // Tokyo
  CH: [6.14, 46.2], // Genève
};

interface HoverState {
  x: number;
  y: number;
  name: string;
  supported?: SupportedCountry;
}

type CountryFeature = Feature<Geometry, { name: string }> & { id?: string | number };

/**
 * Carte du monde interactive : les destinations couvertes par SkyWalk ressortent
 * en teal (halo + marqueur pulsant), le reste du monde attend son tour en gris.
 * Clic sur un pays disponible → sa page destination.
 */
export default function WorldMap() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hover, setHover] = useState<HoverState | null>(null);

  const { countries, pathFor, markers, graticulePath, spherePath } = useMemo(() => {
    const topology = worldTopo as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
    const collection = feature(topology, topology.objects.countries);
    // Antarctique : beaucoup de pixels, zéro expatriation — on l'écarte pour cadrer le reste.
    const countries = (collection.features as CountryFeature[]).filter(
      (f) => String(f.id) !== '010',
    );

    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], {
      type: 'FeatureCollection',
      features: countries,
    } as never);
    const path = geoPath(projection);

    const markers = SUPPORTED_COUNTRIES.flatMap((c) => {
      const coords = MARKER_COORDS[c.code];
      const projected = coords ? projection(coords) : null;
      return projected ? [{ country: c, x: projected[0], y: projected[1] }] : [];
    });

    return {
      countries,
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
    const rect = (e.currentTarget as SVGPathElement).ownerSVGElement!.parentElement!.getBoundingClientRect();
    setHover({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      name: f.properties?.name ?? '',
      supported: supportedByNumericId.get(String(f.id).padStart(3, '0')),
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

        {/* Marqueurs pulsants sur les destinations couvertes — décoratifs :
            pointer-events none pour que le clic atteigne le pays en dessous. */}
        {markers.map(({ country, x, y }) => (
          <g key={country.code} pointerEvents="none">
            <circle cx={x} cy={y} r="9" fill="#5EA3C0" opacity="0.25">
              <animate attributeName="r" values="5;11;5" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.35;0.08;0.35" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r="3.2" fill="#fff" stroke="#4891b0" strokeWidth="1.8" />
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
                {hover.supported.flag} {hover.supported.name}
              </p>
              <p className="text-[11px] font-medium text-[#5EA3C0] whitespace-nowrap">
                {t('worldMap.clickToExplore', { defaultValue: 'Disponible — cliquer pour explorer' })}
              </p>
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
