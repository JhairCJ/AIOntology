let currentLang = 'es';
let currentFilter = 'all';
let dbpediaAllLangs = false;

const LANGUAGE_LABELS = {
    es: '🇪🇸 Español',
    en: '🇺🇸 English',
    de: '🇩🇪 Deutsch',
    fr: '🇫🇷 Français',
    ja: '🇯🇵 日本語'
};

const SEARCH_PLACEHOLDERS = {
    es: 'Ej: machine learning, red neuronal, NLP...',
    en: 'Ex: machine learning, neural network, NLP...',
    de: 'z.B. maschinelles Lernen, neuronales Netz...',
    fr: 'Ex: apprentissage automatique, réseau neuronal...',
    ja: '例: 機械学習, ニューラルネットワーク...'
};

const translations = {
    es: {
        subtitle: 'Inteligencia Artificial — Ontología Local + DBpedia Multilingüe',
        searchTitle: 'Buscar en la Ontología',
        langHintPrefix: 'Idioma de búsqueda',
        searchPlaceholder: 'Ej: machine learning, red neuronal, NLP...',
        searchBtn: 'Buscar',
        filterAll: 'Todos',
        filterClass: 'Clases',
        filterProperty: 'Propiedades',
        filterIndividual: 'Individuos',
        resultsFound: 'resultados encontrados',
        noResults: 'No se encontraron resultados',
        noResultsMsg: 'Intenta con otros términos de búsqueda',
        loading: 'Buscando...',
        parents: 'Superclases',
        subclasses: 'Subclases',
        domain: 'Dominio',
        range: 'Rango',
        classes: 'Clases',
        instances: 'Instancias',
        statClasses: 'Clases',
        statProperties: 'Propiedades',
        statIndividuals: 'Individuos',
        offlineResults: 'Resultados Locales',
        onlineResults: 'Resultados Online',
        viewOnDBpedia: 'Ver en DBpedia',
        dbpediaMultilingual: 'DBpedia Multilingüe (EN, ES, DE, FR, JA)',
        dbpediaAllLabel: 'Buscar DBpedia en todos los idiomas',
        dbpediaScopeSingle: 'DBpedia en',
        dbpediaScopeAll: 'DBpedia en todos los idiomas'
    },
    en: {
        subtitle: 'Artificial Intelligence — Local Ontology + Multilingual DBpedia',
        searchTitle: 'Search in Ontology',
        langHintPrefix: 'Search language',
        searchPlaceholder: 'Ex: machine learning, neural network, NLP...',
        searchBtn: 'Search',
        filterAll: 'All',
        filterClass: 'Classes',
        filterProperty: 'Properties',
        filterIndividual: 'Individuals',
        resultsFound: 'results found',
        noResults: 'No results found',
        noResultsMsg: 'Try different search terms',
        loading: 'Searching...',
        parents: 'Superclasses',
        subclasses: 'Subclasses',
        domain: 'Domain',
        range: 'Range',
        classes: 'Classes',
        instances: 'Instances',
        statClasses: 'Classes',
        statProperties: 'Properties',
        statIndividuals: 'Individuals',
        offlineResults: 'Local Results',
        onlineResults: 'Online Results',
        viewOnDBpedia: 'View on DBpedia',
        dbpediaMultilingual: 'Multilingual DBpedia (EN, ES, DE, FR, JA)',
        dbpediaAllLabel: 'Search DBpedia in all languages',
        dbpediaScopeSingle: 'DBpedia in',
        dbpediaScopeAll: 'DBpedia in all languages'
    }
};

function getTranslations(lang) {
    return translations[lang] || translations.en;
}

function updateLangHint() {
    const t = getTranslations(currentLang);
    const label = LANGUAGE_LABELS[currentLang] || currentLang.toUpperCase();
    document.getElementById('langHint').textContent = `${t.langHintPrefix}: ${label}`;
}

function changeLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
    const t = getTranslations(lang);
    document.getElementById('subtitle').textContent = t.subtitle;
    document.getElementById('searchTitle').textContent = t.searchTitle;
    document.getElementById('searchInput').placeholder = SEARCH_PLACEHOLDERS[lang] || t.searchPlaceholder;
    document.getElementById('searchBtn').textContent = t.searchBtn;
    document.getElementById('filterAll').textContent = t.filterAll;
    document.getElementById('filterClass').textContent = t.filterClass;
    document.getElementById('filterProperty').textContent = t.filterProperty;
    document.getElementById('filterIndividual').textContent = t.filterIndividual;
    document.getElementById('dbpediaAllLabel').textContent = t.dbpediaAllLabel;
    updateLangHint();
    loadStats();
    const query = document.getElementById('searchInput').value;
    if (query) {
        performSearch();
    }
}

function onDbpediaAllChange() {
    dbpediaAllLangs = document.getElementById('dbpediaAllLangs').checked;
    const query = document.getElementById('searchInput').value;
    if (query) {
        performSearch();
    }
}

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    const query = document.getElementById('searchInput').value;
    if (query) {
        performSearch();
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        const t = getTranslations(currentLang);
        const statsHtml = `
            <div class="stat-card">
                <div class="stat-number">${data.local.classes}</div>
                <div class="stat-label">${t.statClasses}</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.local.object_properties + data.local.data_properties}</div>
                <div class="stat-label">${t.statProperties}</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.local.individuals}</div>
                <div class="stat-label">${t.statIndividuals}</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">🌐</div>
                <div class="stat-label">${t.dbpediaMultilingual}</div>
            </div>
        `;
        document.getElementById('stats').innerHTML = statsHtml;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        return;
    }
    const resultsContainer = document.getElementById('resultsContainer');
    const results = document.getElementById('results');
    const t = getTranslations(currentLang);
    resultsContainer.style.display = 'block';
    results.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>${t.loading}</p>
        </div>
    `;
    try {
        const dbpediaAllParam = dbpediaAllLangs ? '&dbpedia_all=true' : '';
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${currentLang}&type=${currentFilter}${dbpediaAllParam}`);
        const data = await response.json();
        
        document.getElementById('resultsCount').textContent = `${data.total} ${t.resultsFound}`;
        
        const dbpediaScope = data.dbpedia_all_langs
            ? t.dbpediaScopeAll
            : `${t.dbpediaScopeSingle} ${LANGUAGE_LABELS[data.dbpedia_lang] || data.dbpedia_lang}`;
        const sourceStatsHtml = `
            <span class="source-stat source-offline">💾 ${data.statistics.offline} ${t.offlineResults}</span>
            <span class="source-stat source-online">🌐 ${data.statistics.online} ${t.onlineResults}</span>
            <span class="source-stat source-online">${dbpediaScope}</span>
        `;
        document.getElementById('sourceStats').innerHTML = sourceStatsHtml;
        
        if (data.results.length === 0) {
            results.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>${t.noResults}</h3>
                    <p>${t.noResultsMsg}</p>
                </div>
            `;
        } else {
            results.innerHTML = data.results.map(result => createResultCard(result)).join('');
        }
    } catch (error) {
        console.error('Error searching:', error);
        results.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">⚠️</div>
                <h3>Error</h3>
                <p>Hubo un error al realizar la búsqueda</p>
            </div>
        `;
    }
}

function createResultCard(result) {
    const typeClass = result.type === 'Clase' ? 'type-class' : 
                     result.type === 'Individuo' ? 'type-individual' : 
                     result.type === 'Propiedad' ? 'type-property' : 
                     'type-dbpedia';
    
    const langBadge = result.dbpedia_lang ?
        `<span class="source-badge source-online-badge">${result.dbpedia_lang.toUpperCase()}</span>` : '';

    const sourceBadge = result.source === 'online' ? 
        `<span class="source-badge source-online-badge">🌐 Online</span>${langBadge}` : 
        '<span class="source-badge source-offline-badge">💾 Offline</span>';
    
    let relations = '';
    const t = getTranslations(currentLang);
    
    if (result.parents && result.parents.length > 0) {
        relations += result.parents.map(p => `<span class="relation-tag">↑ ${p}</span>`).join('');
    }
    if (result.subclasses && result.subclasses.length > 0) {
        relations += result.subclasses.map(s => `<span class="relation-tag">↓ ${s}</span>`).join('');
    }
    if (result.domain && result.domain.length > 0) {
        relations += result.domain.map(d => `<span class="relation-tag">${t.domain}: ${d}</span>`).join('');
    }
    if (result.range && result.range.length > 0) {
        relations += result.range.map(r => `<span class="relation-tag">${t.range}: ${r}</span>`).join('');
    }
    if (result.classes && result.classes.length > 0) {
        relations += result.classes.map(c => `<span class="relation-tag">⊂ ${c}</span>`).join('');
    }

    const dbpediaLang = result.dbpedia_lang || '';
    
    return `
        <div class="result-card" data-name="${encodeURIComponent(result.name)}" data-source="${result.source}" data-dbpedia-lang="${dbpediaLang}" onclick="handleResultClick(this)">
            <div class="result-header">
                <div>
                    <div class="result-title">${result.label} ${sourceBadge}</div>
                </div>
                <span class="result-type ${typeClass}">${result.type}</span>
            </div>
            <div class="result-comment">${result.comment}</div>
            ${relations ? `<div class="result-relations">${relations}</div>` : ''}
        </div>
    `;
}

function handleResultClick(element) {
    const name = decodeURIComponent(element.dataset.name);
    const source = element.dataset.source;
    const dbpediaLang = element.dataset.dbpediaLang || null;
    showDetails(name, source, dbpediaLang);
}

async function showDetails(entityName, source = 'offline', dbpediaLang = null) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    const t = getTranslations(currentLang);
    content.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>${t.loading}</p>
        </div>
    `;
    modal.style.display = 'block';
    try {
        let detailsUrl = `/api/details/${encodeURIComponent(entityName)}?lang=${currentLang}&source=${source}`;
        if (source === 'online' && dbpediaLang) {
            detailsUrl += `&dbpedia_lang=${dbpediaLang}`;
        }
        const response = await fetch(detailsUrl);
        const data = await response.json();
        
        let detailHtml = `
            <div class="detail-section">
                <div class="detail-title">${data.label}</div>
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px; flex-wrap: wrap;">
                    <span class="result-type ${getTypeClass(data.type)}">${data.type}</span>
                    ${data.source === 'online' ? 
                      `<span class="source-badge source-online-badge">🌐 DBpedia ${data.dbpedia_source || data.dbpedia_lang || ''}</span>` : 
                      '<span class="source-badge source-offline-badge">💾 Fuente: Ontología Local</span>'}
                </div>
                <p style="margin-top: 15px;">${data.comment}</p>
                ${data.iri ? `<p style="color: #999; font-size: 0.9em; margin-top: 10px;">IRI: ${data.iri}</p>` : ''}
                ${data.external_link ? `<a href="${data.external_link}" target="_blank" class="external-link">${t.viewOnDBpedia}</a>` : ''}
            </div>
        `;
        
        if (data.parents && data.parents.length > 0) {
            detailHtml += `
                <div class="detail-section">
                    <div class="detail-label">${t.parents}:</div>
                    <ul class="detail-list">
                        ${data.parents.map(p => `<li onclick="showDetails('${p.name}', 'offline')">${p.label}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        if (data.subclasses && data.subclasses.length > 0) {
            detailHtml += `
                <div class="detail-section">
                    <div class="detail-label">${t.subclasses}:</div>
                    <ul class="detail-list">
                        ${data.subclasses.map(s => `<li onclick="showDetails('${s.name}', 'offline')">${s.label}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        if (data.instances && data.instances.length > 0) {
            detailHtml += `
                <div class="detail-section">
                    <div class="detail-label">${t.instances}:</div>
                    <ul class="detail-list">
                        ${data.instances.map(i => `<li onclick="showDetails('${i.name}', 'offline')">${i.label}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        if (data.domain && data.domain.length > 0) {
            detailHtml += `
                <div class="detail-section">
                    <div class="detail-label">${t.domain}:</div>
                    <ul class="detail-list">
                        ${data.domain.map(d => `<li onclick="showDetails('${d.name}', 'offline')">${d.label}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        if (data.range && data.range.length > 0) {
            detailHtml += `
                <div class="detail-section">
                    <div class="detail-label">${t.range}:</div>
                    <ul class="detail-list">
                        ${data.range.map(r => `<li onclick="showDetails('${r.name}', 'offline')">${r.label}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        if (data.classes && data.classes.length > 0) {
            detailHtml += `
                <div class="detail-section">
                    <div class="detail-label">${t.classes}:</div>
                    <ul class="detail-list">
                        ${data.classes.map(c => `<li onclick="showDetails('${c.name}', 'offline')">${c.label}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        content.innerHTML = detailHtml;
    } catch (error) {
        console.error('Error loading details:', error);
        content.innerHTML = '<p>Error al cargar los detalles</p>';
    }
}

function getTypeClass(type) {
    if (type === 'Clase') return 'type-class';
    if (type === 'Individuo') return 'type-individual';
    if (type === 'Propiedad') return 'type-property';
    if (type === 'DBPedia' || type === 'Recurso DBpedia') return 'type-dbpedia';
    return 'type-class';
}

function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

loadStats();
updateLangHint();
