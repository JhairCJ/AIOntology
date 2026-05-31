# Motor de Búsqueda para Ontología de Inteligencia Artificial

Sistema de búsqueda multilingüe (español/inglés) para ontologías OWL, con integración híbrida a DBpedia.

## 📋 Características

- ✅ Búsqueda en clases, propiedades e individuos
- ✅ Búsqueda híbrida: ontología local + DBpedia online
- ✅ Soporte multilingüe (ES/EN)
- ✅ Filtros por tipo de entidad
- ✅ Vista detallada con navegación entre conceptos
- ✅ Interfaz moderna y responsive
- ✅ Ranking de resultados por relevancia
- ✅ Estadísticas de la ontología

## 🚀 Instalación

### 1. Estructura del proyecto

```
AIOntology/
│
├── app.py                              # Backend Flask
├── requirements.txt                    # Dependencias
├── ArtificialIntelligenceOntology.rdf  # Ontología OWL de IA
│
└── templates/
    └── index.html                      # Frontend
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Ejecución

```bash
python app.py
```

El servidor se iniciará en: **http://127.0.0.1:5000/**

## 🎯 Uso

1. **Buscar**: Escribe un término en la barra de búsqueda (ej: `machine learning`, `red neuronal`, `NLP`)
2. **Filtrar**: Selecciona "Clases", "Propiedades" o "Individuos"
3. **Cambiar idioma**: Haz clic en ES 🇪🇸 o EN 🇺🇸
4. **Ver detalles**: Haz clic en cualquier resultado
5. **Navegar**: En la vista detallada, haz clic en conceptos relacionados

## 🔧 Personalización

### Cambiar colores

Edita en `static/styles.css` las siguientes líneas:

```css
/* Línea 14 - Fondo degradado */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Línea 184 - Botones */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Modificar límite de resultados

En `app.py`, parámetro `limit` en `search_dbpedia_online()` y `page_size` en `/api/search`.

### Agregar más idiomas

1. En `app.py`, modifica las funciones `get_label()` y `get_comment()` para aceptar más idiomas
2. En `templates/index.html`, agrega traducciones al objeto `translations`
3. Agrega botones de idioma en el HTML

## 📊 API Endpoints

### GET /api/search
Busca en la ontología local y en DBpedia

**Parámetros:**
- `q`: término de búsqueda (requerido)
- `lang`: idioma (es/en, default: es)
- `type`: filtro (all/class/property/individual, default: all)
- `online`: habilitar búsqueda en DBpedia (true/false, default: true)

**Ejemplo:**
```
GET /api/search?q=machine%20learning&lang=es&type=class
```

### GET /api/details/<entity_name>
Obtiene detalles de una entidad

**Parámetros:**
- `lang`: idioma (es/en, default: es)
- `source`: offline u online (default: offline)

**Ejemplo:**
```
GET /api/details/NeuralNetwork?lang=en
```

### GET /api/stats
Obtiene estadísticas de la ontología

**Ejemplo:**
```
GET /api/stats
```

## 🐛 Solución de Problemas

### Error: "Ontología no cargada"
- Verifica que `ArtificialIntelligenceOntology.rdf` existe en la raíz del proyecto
- Revisa que el archivo OWL no esté corrupto

### Error: "ModuleNotFoundError: No module named 'owlready2'"
- Ejecuta: `pip install owlready2`

### No aparecen las etiquetas en español/inglés
- Verifica que tu ontología tiene anotaciones `rdfs:label` con tags de idioma
- Revisa en Protégé que las anotaciones estén correctamente configuradas

### Los resultados no son relevantes
- Ajusta la función `calculate_relevance()` en `app.py`
- Modifica los pesos de coincidencia según tus necesidades

## 👨‍💻 Tecnologías

- **Backend**: Python 3.8+, Flask
- **Ontología**: Owlready2, RDF/OWL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Datos online**: DBpedia SPARQL

## 📄 Licencia

Este proyecto es de código abierto para uso educativo.

---

Desarrollado para proyecto académico de Ontologías de Inteligencia Artificial
