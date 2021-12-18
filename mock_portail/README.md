# Mock Portail

Cette petite app Django a pour but de simuler l'interface du portail des assos, en fournissant une route pour lister des associations.

## Routes

`mock_portail/list_assos/` -> renvoie un fichier JSON avec une fausse liste d'associations 

```json
{
	'assos': [uuid1, uuid2...]
}
```
