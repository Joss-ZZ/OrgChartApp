# Org Chart App

## Instalación

No olviden ejecutar el siguiente comando en la terminal para reconstruir los módulos de node e instalar las dependencias:
```
	npm install
```

Ejecutar el siguiente comando en la terminal para instalar JSON Server:
```
	npm install -g json-server
```
Crear un archivo "db.json" y pegar lo siguiente:
```
{
    "OrganizationalUnit": [
        {
            "id": 1,
            "brand": "assets/brands/facebook.png",
            "name": "Facebook",
            "type": "COMPANY"
        },
        {
            "id": 2,
            "brand": "assets/brands/twitter.png",
            "name": "Twitter",
            "type": "COMPANY",
            "parentId": 1
        },
        {
            "id": 3,
            "brand": "assets/brands/instagram.png",
            "name": "Instagram",
            "type": "COMPANY",
            "parentId": 1
        },
        {
            "id": 4,
            "name": "Directorio",
            "prefix": "DI",
            "type": "DEPARTMENT",
            "parentId": 2,
            "leaderId": 1
        },
        {
            "id": 5,
            "name": "Gerencia Mancomunada",
            "prefix": "GM",
            "type": "DEPARTMENT",
            "parentId": 2,
            "leaderId": 2
        },
        {
            "id": 6,
            "name": "Planeamiento y Desarrollo",
            "prefix": "PD",
            "type": "TEAM",
            "parentId": 4,
            "leaderId": 3
        }
    ],
    "Employee": [
        {
            "id": 1,
            "profile": "assets/profile/mariazavaleta.png",
            "position": "LEADER",
            "fullname": "María Zavaleta",
            "job": "Director General",
            "organizationalUnitId": 4
          },
          {
            "id": 2,
            "profile": "assets/profile/juanquispe.png",
            "position": "LEADER",
            "fullname": "Juan Quispe",
            "job": "Gerente General",
            "organizationalUnitId": 5
          },
          {
            "id": 3,
            "profile": "assets/profile/juanquispe.png",
            "position": "LEADER",
            "fullname": "Roberto Gomez",
            "job": "Jefe de Planeamiento",
            "organizationalUnitId": 6
          },
          {
            "id": 4,
            "profile": "assets/profile/mariazavaleta.png",
            "position": "COLLABORATOR",
            "fullname": "Sabrina Qin",
            "job": "Diseñador",
            "organizationalUnitId": 6
          }
    ]
  }
```

Abrir otra ventana de la terminal, navegar hacia la carpeta en donde se encuentra su archivo "db.json" y ejecutar el siguiente comando:
```
json-server --watch db.json
```

Abrir otra ventana de la terminal y ejecutar la aplicación:
```
ng serve -o
```