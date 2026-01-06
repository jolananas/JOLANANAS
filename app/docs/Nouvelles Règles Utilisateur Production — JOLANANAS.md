# 📋 NOUVELLES RÈGLES UTILISATEUR - PRODUCTION STRICT

## Date: 2025-01-03

### 🚫 INTERDICTIONS STRICTES

#### Règle 1: DONNÉES RÉELLES UNIQUEMENT

```md
"STRICT: Données réelles uniquement - Aucun mock, fake data, test data, données d'exemple ou placeholder. 
Toujours utiliser les vraies données de production (API Shopify réelles, base de données réelle, intégrations réelles). 
Si l'accès aux données réelles est impossible, créer des interfaces vides plutôt que des mocks."
```

#### Règle 2: CODE PRODUCTION-READY OBLIGATOIRE  

```md
"PRODUCTION-READY STRICT: Code fonctionnel et commercialisable uniquement. 
Aucun code de test, prototype ou démo. 
Chaque fonctionnalité doit être complète, testée en conditions réelles et prête pour la commercialisation. 
Pas de demi-mesures ou de fonctionnalités 'qui marchent un peu'."
```

#### Règle 3: TODOS OBLIGATOIRES ET TRAÇABLES

```md
"TODOS MANDATORY: Tous les TODOs doivent être créés, listés et suivis avec todo_write. 
Promettre une fonctionnalité = créer un TODO. 
Un TODO oublié = violation des règles. 
Chaque TODO doit être marqué comme completed une fois terminé. 
Pas de fonctionnalités mentionnées sans TODO correspondant."
```

#### Règle 4: INTERFACES RÉELLES UNIQUEMENT

```md
"INTERFACES RÉELLES: Les interfaces utilisateur doivent utiliser de vraies données. 
Tous les composants doivent être connectés aux APIs/cache réels. 
Pas de setTimeout/simulation pour l'affichage."
```

#### Règle 5: TESTS EN CONDITIONS RÉELLES

```md
"TESTS EN CONDITIONS RÉELLES: Si des tests sont nécessaires, ils doivent utiliser les vraies APIs et vraies données. 
Pas de tests avec des données factices ou des environnements de test simulés."
```

### ✅ PRINCIPES DIRECTEURS

1. **ZÉRO TOLÉRANCE** pour les données fictives
2. **FONCTIONNALITÉ COMPLÈTE** avant tout
3. **COMMERCIALISABLE IMMÉDIATEMENT**
4. **INTÉGRATIONS RÉELLES** uniquement
5. **SUIVI OBLIGATOIRE** des TODOs

### 🎯 RÉSULTATS ATTENDUS

- ✅ Code production-ready immédiatement
- ✅ Aucune donnée fictive dans le projet  
- ✅ TODOs obligatoires et jamais oubliés
- ✅ Interfaces connectées aux vraies APIs
- ✅ Fonctionnalités complètes et commercialisables

---
**Statut**: EN VIGUEUR IMMÉDIATEMENT
**Priorité**: CRITIQUE - AUCUNE EXCEPTION POSSIBLE
