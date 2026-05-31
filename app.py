from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from owlready2 import get_ontology, locstr
import unicodedata
import os
from SPARQLWrapper import SPARQLWrapper, JSON
import re

app = Flask(__name__, template_folder='templates')
CORS(app)

# Cargar la ontología
ontology = None
ONTOLOGY_PATH = "ArtificialIntelligenceOntology.rdf"

DBPEDIA_SOURCES = {
    'en': {
        'endpoint': 'https://dbpedia.org/sparql',
        'page_base': 'https://dbpedia.org/page/',
        'resource_base': 'http://dbpedia.org/resource/',
        'lang_tag': 'en',
        'label': 'English',
        'category_patterns': [
            "artificial_intelligence",
            "machine_learning",
            "deep_learning",
            "natural_language_processing",
            "computer_vision",
            "neural_network",
            "artificial_neural",
            "reinforcement_learning",
            "generative_artificial_intelligence",
            "expert_system",
            "knowledge_representation",
            "large_language_model",
            "computational_linguistics",
            "speech_recognition",
            "data_mining",
            "pattern_recognition",
        ],
        'field_uris': [
            "http://dbpedia.org/resource/Artificial_intelligence",
            "http://dbpedia.org/resource/Machine_learning",
        ],
    },
    'es': {
        'endpoint': 'https://es.dbpedia.org/sparql',
        'page_base': 'https://es.dbpedia.org/page/',
        'resource_base': 'http://es.dbpedia.org/resource/',
        'lang_tag': 'es',
        'label': 'Español',
        'category_patterns': [
            "inteligencia_artificial",
            "aprendizaje_automatico",
            "aprendizaje_profundo",
            "procesamiento_de_lenguajes_natural",
            "vision_artificial",
            "red_neuronal",
            "redes_neuronales",
            "sistemas_expertos",
            "representacion_del_conocimiento",
            "reconocimiento_de_patrones",
            "mineria_de_datos",
            "reconocimiento_del_habla",
        ],
        'field_uris': [
            "http://es.dbpedia.org/resource/Inteligencia_artificial",
            "http://es.dbpedia.org/resource/Aprendizaje_automatico",
        ],
    },
    'de': {
        'endpoint': 'https://de.dbpedia.org/sparql',
        'page_base': 'https://de.dbpedia.org/page/',
        'resource_base': 'http://de.dbpedia.org/resource/',
        'lang_tag': 'de',
        'label': 'Deutsch',
        'category_patterns': [
            "kuenstliche_intelligenz",
            "maschinelles_lernen",
            "deep_learning",
            "neuronales_netz",
            "natuerliche_sprachverarbeitung",
            "computersehen",
            "expertenystem",
            "wissensrepraesentation",
            "musterekennung",
            "spracherkennung",
        ],
        'field_uris': [
            "http://de.dbpedia.org/resource/K%C3%BCnstliche_Intelligenz",
            "http://de.dbpedia.org/resource/Maschinelles_Lernen",
        ],
    },
    'fr': {
        'endpoint': 'https://fr.dbpedia.org/sparql',
        'page_base': 'https://fr.dbpedia.org/page/',
        'resource_base': 'http://fr.dbpedia.org/resource/',
        'lang_tag': 'fr',
        'label': 'Français',
        'category_patterns': [
            "intelligence_artificielle",
            "apprentissage_automatique",
            "apprentissage_profond",
            "traitement_automatique_des_langues",
            "vision_par_ordinateur",
            "reseau_neuronal",
            "systeme_expert",
            "representation_des_connaissances",
            "reconnaissance_de_formes",
            "exploration_de_donnees",
            "reconnaissance_vocale",
        ],
        'field_uris': [
            "http://fr.dbpedia.org/resource/Intelligence_artificielle",
            "http://fr.dbpedia.org/resource/Apprentissage_automatique",
        ],
    },
    'ja': {
        'endpoint': 'https://ja.dbpedia.org/sparql',
        'page_base': 'https://ja.dbpedia.org/page/',
        'resource_base': 'http://ja.dbpedia.org/resource/',
        'lang_tag': 'ja',
        'label': '日本語',
        'category_patterns': [
            "人工知能",
            "%E4%BA%BA%E5%B7%A5%E7%9F%A5%E8%83%BD",
            "機械学習",
            "%E6%A9%9F%E6%A2%B0%E5%AD%A6%E7%BF%92",
            "深層学習",
            "自然言語処理",
            "コンピュータビジョン",
            "ニューラルネットワーク",
            "エキスパートシステム",
            "知識表現",
            "パターン認識",
            "データマイニング",
            "音声認識",
        ],
        'field_uris': [
            "http://ja.dbpedia.org/resource/%E4%BA%BA%E5%B7%A5%E7%9F%A5%E8%83%BD",
            "http://ja.dbpedia.org/resource/%E6%A9%9F%E6%A2%B0%E5%AD%A6%E7%BF%92",
        ],
    },
}

def load_ontology():
    global ontology
    if os.path.exists(ONTOLOGY_PATH):
        abs_path = os.path.abspath(ONTOLOGY_PATH)
        ontology = get_ontology(abs_path).load()
        print(f"✅ Ontología cargada: {len(list(ontology.classes()))} clases, {len(list(ontology.individuals()))} individuos")
    else:
        print(f"❌ Error: No se encuentra {ONTOLOGY_PATH}")

def get_label(entity, lang='es'):
    """Obtiene la etiqueta en el idioma especificado"""
    if hasattr(entity, 'label'):
        labels = entity.label
        if labels:
            for label in labels:
                if hasattr(label, 'lang') and label.lang == lang:
                    return str(label)
            return str(labels[0]) if labels else entity.name
    return entity.name

def get_comment(entity, lang='es'):
    """Obtiene el comentario en el idioma especificado"""
    if hasattr(entity, 'comment'):
        comments = entity.comment
        if comments:
            for comment in comments:
                if hasattr(comment, 'lang') and comment.lang == lang:
                    return str(comment)
            return str(comments[0]) if comments else ""
    return ""

def normalize_text(text):
    if text is None:
        return ""
    t = unicodedata.normalize('NFKD', str(text))
    t = t.encode('ascii', 'ignore').decode('ascii')
    return t.strip().lower()

def search_classes(query, lang='es'):
    """Busca en las clases de la ontología"""
    results = []
    query_lower = normalize_text(query)
    
    for cls in ontology.classes():
        label_display = get_label(cls, lang)
        label = normalize_text(label_display)
        comment = normalize_text(get_comment(cls, lang))
        name = normalize_text(cls.name)
        
        if query_lower in label or query_lower in name or query_lower in comment:
            parents = [get_label(p, lang) for p in cls.is_a if isinstance(p, type)]
            subclasses = [get_label(sub, lang) for sub in cls.subclasses()]
            
            results.append({
                'name': cls.name,
                'label': label_display,
                'type': 'Clase',
                'comment': get_comment(cls, lang) or "Clase de inteligencia artificial",
                'parents': parents[:3],
                'subclasses': subclasses[:5],
                'relevance': calculate_relevance(query_lower, label, name, comment, 'class'),
                'source': 'offline'
            })
    
    return results

def search_properties(query, lang='es'):
    """Busca en las propiedades de la ontología"""
    results = []
    query_lower = normalize_text(query)
    
    for prop in ontology.object_properties():
        label_display = get_label(prop, lang)
        label = normalize_text(label_display)
        comment = normalize_text(get_comment(prop, lang))
        name = normalize_text(prop.name)
        
        if query_lower in label or query_lower in name or query_lower in comment:
            domain = [get_label(d, lang) for d in prop.domain] if prop.domain else []
            range_val = [get_label(r, lang) for r in prop.range] if prop.range else []
            
            results.append({
                'name': prop.name,
                'label': label_display,
                'type': 'Propiedad',
                'comment': get_comment(prop, lang) or "Propiedad de la ontología",
                'domain': domain,
                'range': range_val,
                'relevance': calculate_relevance(query_lower, label, name, comment, 'property'),
                'source': 'offline'
            })
    
    for prop in ontology.data_properties():
        label_display = get_label(prop, lang)
        label = normalize_text(label_display)
        comment = normalize_text(get_comment(prop, lang))
        name = normalize_text(prop.name)
        
        if query_lower in label or query_lower in name or query_lower in comment:
            domain = [get_label(d, lang) for d in prop.domain] if prop.domain else []
            
            results.append({
                'name': prop.name,
                'label': label_display,
                'type': 'Propiedad',
                'comment': get_comment(prop, lang) or "Propiedad de datos",
                'domain': domain,
                'range': [],
                'relevance': calculate_relevance(query_lower, label, name, comment, 'property'),
                'source': 'offline'
            })
    
    return results

def search_individuals(query, lang='es'):
    """Busca en los individuos de la ontología"""
    results = []
    query_lower = normalize_text(query)
    
    for ind in ontology.individuals():
        label_display = get_label(ind, lang)
        label = normalize_text(label_display)
        name = normalize_text(ind.name)
        comment = normalize_text(get_comment(ind, lang))
        
        if query_lower in label or query_lower in name or query_lower in comment:
            classes = [get_label(c, lang) for c in ind.is_a if isinstance(c, type)]
            
            results.append({
                'name': ind.name,
                'label': label_display,
                'type': 'Individuo',
                'comment': get_comment(ind, lang) or "Instancia de inteligencia artificial",
                'classes': classes,
                'relevance': calculate_relevance(query_lower, label, name, comment, 'individual'),
                'source': 'offline'
            })
    
    return results

def calculate_relevance(query, label, name, comment, entity_type):
    score = 0
    if query == label:
        score += 120
    elif label.startswith(query):
        score += 70
    elif query in label:
        score += 40
    if query == name:
        score += 90
    elif name.startswith(query):
        score += 60
    elif query in name:
        score += 30
    if query and comment and query in comment:
        score += 20
    score -= len(label) * 0.1
    if entity_type == 'class':
        score += 5
    elif entity_type == 'individual':
        score += 3
    return score

def escape_sparql_string(text):
    """Escapa caracteres especiales para usar en literales SPARQL"""
    return str(text).replace('\\', '\\\\').replace('"', '\\"')

def build_ai_category_filter(source_config):
    """Genera filtro SPARQL para categorías y campos relacionados con IA"""
    category_checks = " || ".join(
        f'CONTAINS(LCASE(STR(?subject)), "{escape_sparql_string(pattern.lower())}")'
        for pattern in source_config['category_patterns']
    )
    field_unions = "\n".join(
        f"          UNION {{ ?resource dbo:field <{uri}> . }}"
        for uri in source_config.get('field_uris', [])
    )
    return f"""
          {{
            ?resource dct:subject ?subject .
            FILTER({category_checks})
          }}
          {field_unions}
    """

def build_query_term_filters(query):
    """Coincidencia flexible: cada palabra debe aparecer en label o abstract"""
    terms = [t for t in re.split(r'\s+', query.strip()) if t]
    if not terms:
        return 'false'

    term_filters = []
    for term in terms:
        safe_term = escape_sparql_string(term.lower())
        term_filters.append(
            f'(CONTAINS(LCASE(?label), "{safe_term}") || '
            f'(BOUND(?abstract) && CONTAINS(LCASE(?abstract), "{safe_term}")))'
        )
    return " && ".join(term_filters)

def search_dbpedia_endpoint(query, source_config, limit=10, preferred_lang=None):
    """Busca en un endpoint DBpedia específico"""
    lang_code = source_config['lang_tag']
    try:
        sparql = SPARQLWrapper(source_config['endpoint'])
        sparql.addCustomHttpHeader("User-Agent", "ArtificialIntelligenceSearchBot/1.0")
        sparql.setTimeout(45)

        query_terms_filter = build_query_term_filters(query)
        ai_scope_filter = build_ai_category_filter(source_config)

        search_query = f"""
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX dbo: <http://dbpedia.org/ontology/>
        PREFIX dct: <http://purl.org/dc/terms/>

        SELECT DISTINCT ?resource ?label ?abstract WHERE {{
          {ai_scope_filter}
          ?resource rdfs:label ?label .
          FILTER(LANG(?label) = '{lang_code}')
          OPTIONAL {{
            ?resource dbo:abstract ?abstract .
            FILTER(LANG(?abstract) = '{lang_code}')
          }}
          FILTER({query_terms_filter})
        }}
        LIMIT {limit}
        """

        sparql.setQuery(search_query)
        sparql.setReturnFormat(JSON)
        results = sparql.query().convert()

        formatted_results = []
        for result in results["results"]["bindings"]:
            resource_uri = result["resource"]["value"]
            resource_name = resource_uri.split("/")[-1]

            comment = result.get("abstract", {}).get("value", "")
            if not comment:
                comment = f"Recurso de inteligencia artificial relacionado con '{query}'"
            elif len(comment) > 200:
                comment = comment[:197] + "..."

            relevance = 45
            if preferred_lang and lang_code == preferred_lang:
                relevance += 12
            elif preferred_lang == 'es' and lang_code == 'en':
                relevance += 5

            formatted_results.append({
                'name': resource_name,
                'label': result["label"]["value"],
                'type': 'DBPedia',
                'comment': comment,
                'source': 'online',
                'dbpedia_lang': lang_code,
                'dbpedia_source': source_config['label'],
                'uri': resource_uri,
                'relevance': relevance,
                'external_link': f"{source_config['page_base']}{resource_name}"
            })

        return formatted_results

    except Exception as e:
        print(f"❌ Error en DBpedia ({lang_code}): {e}")
        return []

def search_dbpedia_online(query, search_lang='en', limit_per_lang=10, search_all_langs=False):
    """Busca en DBpedia. Por defecto solo en el idioma seleccionado."""
    if search_all_langs:
        all_results = []
        seen_uris = set()
        for lang_code, source_config in DBPEDIA_SOURCES.items():
            endpoint_results = search_dbpedia_endpoint(
                query,
                source_config,
                limit=limit_per_lang,
                preferred_lang=search_lang,
            )
            for result in endpoint_results:
                uri = result.get('uri')
                if uri in seen_uris:
                    continue
                seen_uris.add(uri)
                all_results.append(result)
        return all_results

    if search_lang not in DBPEDIA_SOURCES:
        search_lang = 'en'
    return search_dbpedia_endpoint(
        query,
        DBPEDIA_SOURCES[search_lang],
        limit=25,
        preferred_lang=search_lang,
    )

def search_hybrid(query, lang='es', filter_type='all', online_search=True, dbpedia_all_langs=False):
    """Búsqueda híbrida: local + online"""
    all_results = []
    
    # BÚSQUEDA OFFLINE (Local)
    offline_results = []
    
    if filter_type == 'all' or filter_type == 'class':
        offline_results.extend(search_classes(query, lang))
    
    if filter_type == 'all' or filter_type == 'property':
        offline_results.extend(search_properties(query, lang))
    
    if filter_type == 'all' or filter_type == 'individual':
        offline_results.extend(search_individuals(query, lang))
    
    all_results.extend(offline_results)
    
    # BÚSQUEDA ONLINE (DBpedia) — idioma = botón seleccionado (o todos si dbpedia_all_langs)
    if online_search:
        dbpedia_lang = lang if lang in DBPEDIA_SOURCES else 'en'
        online_results = search_dbpedia_online(
            query,
            search_lang=dbpedia_lang,
            limit_per_lang=10,
            search_all_langs=dbpedia_all_langs,
        )
        all_results.extend(online_results)
    
    # Ordenar por relevancia
    all_results.sort(key=lambda x: x.get('relevance', 0), reverse=True)
    
    return all_results

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('q', '')
    lang = request.args.get('lang', 'es')
    filter_type = request.args.get('type', 'all')
    online = request.args.get('online', 'true').lower() == 'true'
    dbpedia_all_langs = request.args.get('dbpedia_all', 'false').lower() == 'true'
    
    try:
        page = int(request.args.get('page', '1'))
    except ValueError:
        page = 1
    try:
        page_size = int(request.args.get('page_size', '50'))
    except ValueError:
        page_size = 50
    
    if not query:
        return jsonify({'error': 'Se requiere un término de búsqueda'}), 400
    
    if not ontology:
        return jsonify({'error': 'Ontología no cargada'}), 500
    
    # Búsqueda híbrida
    all_results = search_hybrid(query, lang, filter_type, online, dbpedia_all_langs)
    dbpedia_lang = lang if lang in DBPEDIA_SOURCES else 'en'
    
    # Estadísticas
    offline_count = sum(1 for r in all_results if r.get('source') == 'offline')
    online_count = sum(1 for r in all_results if r.get('source') == 'online')
    
    # Paginación
    total = len(all_results)
    start = (page - 1) * page_size
    end = start + page_size
    results_page = all_results[start:end]
    
    return jsonify({
        'query': query,
        'lang': lang,
        'dbpedia_lang': dbpedia_lang,
        'dbpedia_all_langs': dbpedia_all_langs,
        'total': total,
        'page': page,
        'page_size': page_size,
        'online_enabled': online,
        'statistics': {
            'offline': offline_count,
            'online': online_count,
            'total': total
        },
        'results': results_page
    })

@app.route('/api/details/<entity_name>', methods=['GET'])
def get_details(entity_name):
    lang = request.args.get('lang', 'es')
    source = request.args.get('source', 'offline')
    
    if source == 'online':
        dbpedia_lang = request.args.get('dbpedia_lang', 'en')
        source_config = DBPEDIA_SOURCES.get(dbpedia_lang, DBPEDIA_SOURCES['en'])
        return jsonify({
            'name': entity_name,
            'label': entity_name.replace('_', ' '),
            'type': 'Recurso DBpedia',
            'comment': f'Información obtenida de DBpedia ({source_config["label"]})',
            'source': 'online',
            'dbpedia_lang': dbpedia_lang,
            'dbpedia_source': source_config['label'],
            'uri': f'{source_config["resource_base"]}{entity_name}',
            'external_link': f'{source_config["page_base"]}{entity_name}'
        })
    
    # Lógica para detalles offline
    if not ontology:
        return jsonify({'error': 'Ontología no cargada'}), 500
    
    entity = None
    
    # Buscar en clases
    for cls in ontology.classes():
        if cls.name == entity_name:
            entity = cls
            break
    
    # Buscar en propiedades
    if not entity:
        for prop in list(ontology.object_properties()) + list(ontology.data_properties()):
            if prop.name == entity_name:
                entity = prop
                break
    
    # Buscar en individuos
    if not entity:
        for ind in ontology.individuals():
            if ind.name == entity_name:
                entity = ind
                break
    
    if not entity:
        return jsonify({'error': 'Entidad no encontrada'}), 404
    
    # Construir respuesta detallada
    details = {
        'name': entity.name,
        'label': get_label(entity, lang),
        'comment': get_comment(entity, lang) or "Sin descripción disponible",
        'iri': entity.iri,
        'source': 'offline',
        'external_link': None
    }
    
    # Información específica según el tipo
    if isinstance(entity, type):
        details['type'] = 'Clase'
        details['parents'] = [{'name': p.name, 'label': get_label(p, lang)} 
                             for p in entity.is_a if isinstance(p, type)]
        details['subclasses'] = [{'name': s.name, 'label': get_label(s, lang)} 
                                for s in entity.subclasses()]
        details['instances'] = [{'name': i.name, 'label': get_label(i, lang)} 
                               for i in entity.instances()]
        
    elif hasattr(entity, 'domain'):
        details['type'] = 'Propiedad'
        details['domain'] = [{'name': d.name, 'label': get_label(d, lang)} 
                            for d in entity.domain] if entity.domain else []
        details['range'] = [{'name': r.name, 'label': get_label(r, lang)} 
                           for r in entity.range] if entity.range else []
    
    else:
        details['type'] = 'Individuo'
        details['classes'] = [{'name': c.name, 'label': get_label(c, lang)} 
                             for c in entity.is_a if isinstance(c, type)]
    
    return jsonify(details)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Estadísticas extendidas con información online/offline"""
    if not ontology:
        return jsonify({'error': 'Ontología no cargada'}), 500
    
    # Estadísticas locales
    local_stats = {
        'classes': len(list(ontology.classes())),
        'object_properties': len(list(ontology.object_properties())),
        'data_properties': len(list(ontology.data_properties())),
        'individuals': len(list(ontology.individuals())),
        'source': 'offline'
    }
    
    return jsonify({
        'local': local_stats,
        'online': {
            'sources': [
                {
                    'lang': lang_code,
                    'label': config['label'],
                    'endpoint': config['endpoint'],
                }
                for lang_code, config in DBPEDIA_SOURCES.items()
            ],
            'available': True,
            'source': 'DBpedia Multilingual'
        }
    })

if __name__ == '__main__':
    load_ontology()
    app.run(debug=True, host='0.0.0.0', port=5000)