# Documentation d'Intégration Tour Ninja - Amon Tour

## Vue d'ensemble

L'intégration entre Amon Tour et Tour Ninja fonctionne avec un système de synchronisation "pull". Les formulaires sur le site Amon Tour sauvegardent les données localement dans la base de données, puis Tour Ninja peut récupérer ces données via des endpoints API sécurisés.

## Architecture

```
[Site Web Amon Tour] 
    ↓ (Formulaires)
[Base de Données Locale]
    ↓ (API de Synchronisation)
[Tour Ninja Dashboard]
```

## Fonctionnement des Formulaires

### 1. Formulaire de Tour Personnalisé
- **URL Frontend**: `/custom-trip`
- **Endpoint API**: `POST /api/custom-tour-requests`
- **Données collectées**:
  - Nom complet
  - Email
  - Téléphone
  - Nombre d'adultes et d'enfants
  - Dates de voyage
  - Durée
  - Types de voyage (culture, nature, plages, etc.)
  - Destinations (Krabi, Khao Sok, etc.)
  - Message personnalisé

### 2. Formulaire de Croisière
- **URL Frontend**: `/cruise`
- **Endpoint API**: `POST /api/cruise-requests`
- **Données collectées**:
  - Nom complet
  - Email
  - Téléphone
  - Nombre de passagers
  - Durée
  - Dates préférées
  - Itinéraire souhaité
  - Demandes spéciales

## Endpoints de Synchronisation pour Tour Ninja

### 1. Récupération des Demandes de Tours Personnalisés

**Endpoint**: `GET /api/sync/tour-ninja`

**Authentification**: 
- Header: `Authorization: Bearer TOUR_NINJA_API_KEY_2025`

**Paramètres optionnels**:
- `status`: Filtrer par statut (received, processing, completed)
- `since`: Récupérer uniquement les nouvelles entrées depuis une date (format ISO 8601)

**Exemple de requête**:
```bash
curl -X GET https://amontour.com/api/sync/tour-ninja \
  -H "Authorization: Bearer TOUR_NINJA_API_KEY_2025"
```

**Format de réponse**:
```json
{
  "success": true,
  "count": 26,
  "data": [
    {
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "phone": "+33 123456789",
      "tourDate": "2025-03-15 to 2025-03-20",
      "numberOfAdults": 2,
      "numberOfKids": 1,
      "duration": "5 days",
      "message": "Custom tour message",
      "destinations": ["krabi", "khaosok"],
      "budget": "À discuter",
      "status": "received",
      "tripTypes": ["culture", "nature"],
      "amontourId": 53,
      "originalCreatedAt": "2025-11-07T03:48:09.163Z",
      "source": "amontour_custom_tour"
    }
  ],
  "lastSync": "2025-11-07T03:48:36.368Z",
  "filters": {}
}
```

### 2. Récupération des Demandes de Croisières

**Endpoint**: `GET /api/sync/cruise-requests`

**Authentification**: 
- Header: `Authorization: Bearer TOUR_NINJA_API_KEY_2025`

**Paramètres optionnels**:
- `status`: Filtrer par statut (pending, contacted, confirmed, cancelled)
- `since`: Récupérer uniquement les nouvelles entrées depuis une date

**Exemple de requête**:
```bash
curl -X GET https://amontour.com/api/sync/cruise-requests \
  -H "Authorization: Bearer TOUR_NINJA_API_KEY_2025"
```

**Format de réponse**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "customerName": "Jane Smith",
      "customerEmail": "jane@example.com",
      "phone": "+33 987654321",
      "tourDate": "2025-04-10",
      "numberOfAdults": 4,
      "numberOfKids": 0,
      "duration": "3 days",
      "message": "Special requests and itinerary",
      "destinations": ["Krabi to Phi Phi"],
      "budget": "À discuter",
      "status": "received",
      "numberOfGuests": 4,
      "itinerary": "Krabi to Phi Phi",
      "specialRequests": "Vegetarian meals",
      "amontourId": 3,
      "originalCreatedAt": "2025-11-07T03:48:10.015Z",
      "source": "amontour_cruise"
    }
  ],
  "lastSync": "2025-11-07T03:48:37.366Z",
  "filters": {},
  "type": "cruise_requests"
}
```

## Mapping des Statuts

### Pour les Tours Personnalisés
- **Amon Tour** → **Tour Ninja**
  - `new` → `received`
  - `in_progress` → `processing`
  - `archived` → `completed`

### Pour les Croisières
- **Amon Tour** → **Tour Ninja**
  - `pending` → `received`
  - `contacted` → `processing`
  - `confirmed` → `completed`
  - `cancelled` → `cancelled`

## Synchronisation Incrémentale

Pour éviter de récupérer toutes les données à chaque fois, utilisez le paramètre `since` :

```bash
# Récupérer seulement les nouvelles entrées depuis le 1er novembre 2025
curl -X GET https://amontour.com/api/sync/tour-ninja?since=2025-11-01T00:00:00Z \
  -H "Authorization: Bearer TOUR_NINJA_API_KEY_2025"
```

## Fréquence de Synchronisation Recommandée

- **Temps réel**: Webhook (non implémenté actuellement)
- **Polling recommandé**: Toutes les 5-10 minutes
- **Minimum**: Toutes les heures

## Sécurité

1. **Authentification requise**: Toutes les requêtes doivent inclure le header d'autorisation
2. **HTTPS obligatoire**: Toutes les communications doivent être chiffrées
3. **Limitation de taux**: Maximum 100 requêtes par heure par clé API
4. **Validation des données**: Toutes les données sont validées côté serveur

## Support et Dépannage

### Codes d'erreur courants

- **401 Unauthorized**: Clé API manquante ou invalide
- **403 Forbidden**: Accès refusé pour cette clé API
- **429 Too Many Requests**: Limite de taux dépassée
- **500 Internal Server Error**: Erreur serveur, réessayer plus tard

### Logs et Monitoring

Les requêtes de synchronisation sont enregistrées avec :
- Timestamp
- Clé API utilisée
- Paramètres de requête
- Nombre d'enregistrements retournés
- Durée de traitement

## Contact Technique

Pour toute question ou problème technique :
- Email: tech@amontour.com
- Documentation API: https://amontour.com/api/docs

## Changelog

### Version 1.0 (Novembre 2025)
- Implémentation initiale des endpoints de synchronisation
- Support des filtres par statut et date
- Authentification par clé API
- Mapping automatique des formats de données