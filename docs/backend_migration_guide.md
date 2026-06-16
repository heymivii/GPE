# 📘 Guide de Migration API pour l'équipe Front-end

Ce document récapitule les changements récents effectués sur le Back-end du projet **SkyWalk**. Ces modifications visent à standardiser les noms de propriétés et à faciliter l'intégration entre le Front et le Back.

---

## 1. Nouvelle Norme : Tout en `camelCase`

Désormais, **toutes les propriétés** renvoyées par le Backend dans les objets JSON utilisent le format `camelCase`. Les formats `snake_case` (ex: `user_id`) sont progressivement supprimés des réponses API pour mieux coller aux standards JavaScript/TypeScript.

### Exemples de changements :
| Ancienne clé (Back) | Nouvelle clé (Back) | Impact Front |
| :--- | :--- | :--- |
| `created_at` | `createdAt` | `topic.createdAt` |
| `sent_at` | `sentAt` | `message.sentAt` |
| `is_pinned` | `isPinned` | `topic.isPinned` |
| `is_locked` | `isLocked` | `topic.isLocked` |
| `expected_duration` | `expectedDuration` | `project.expectedDuration` |
| `expected_departure_date`| `expectedDepartureDate` | `project.expectedDepartureDate` |
| `user_id` | `userId` | `project.userId` |

---

## 2. Standardisation des Identifiants (IDs)

Pour éviter toute confusion entre les différents IDs d'une même page, les clés primaires utilisent maintenant le format `id[NomDeLEntité]` :

- **Utilisateurs :** `idUser` (au lieu de `id`)
- **Projets :** `idProject` (au lieu de `id_project`)
- **Pays :** `idCountry`
- **Topics Forum :** `idForumTopic`
- **Messages Forum :** `idForumMessage`
- **Signalements :** `idReport`

---

## 3. Mise à jour des Interfaces (src/types/)

Voici un exemple de la structure attendue pour les interfaces TypeScript côté Front :

### Interface `User`
```typescript
export interface User {
  idUser: number;
  fullName: string;
  email: string;
  roles: string; // Utilisation de 'roles' au lieu de 'role' ou 'userRole'
  createdAt: string;
}
```

### Interface `ExpatriationProject`
```typescript
export interface ExpatriationProject {
  idProject: number;
  objective: string;
  expectedDuration: number;
  expectedDepartureDate: string;
  status: string;
  userId: number;
}
```

---

## 4. Pourquoi ces changements ?
1.  **Cohérence :** Aligner le code TypeScript du front avec les objets renvoyés par le back.
2.  **Prévisibilité :** Plus besoin de deviner si un champ est en snake_case ou camelCase.

---
*Note : Si tu rencontres des propriétés `undefined` suite à une mise à jour du Back, vérifie si elles ne sont pas passées en camelCase !*
