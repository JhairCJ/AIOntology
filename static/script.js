let currentLang = 'es';
let currentFilter = 'all';
let dbpediaAllLangs = false;
let searchMode = 'online';
let cachedStatsData = null;  // cache para no repetir peticion de stats al cambiar idioma

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
        dbpediaScopeAll: 'DBpedia en todos los idiomas',
        dataProperties: 'Propiedades de Datos',
        typeClass: 'Clase',
        typeIndividual: 'Individuo',
        typeProperty: 'Propiedad',
        typeDBpedia: 'Recurso DBpedia',
        localSource: '💾 Fuente: Ontología Local',
        errorSearch: 'Hubo un error al realizar la búsqueda',
        errorDetails: 'Error al cargar los detalles',
        pageTitle: 'Motor de Búsqueda - Ontología de Inteligencia Artificial',
        headerTitle: 'Motor de Búsqueda Ontológico'
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
        dbpediaScopeAll: 'DBpedia in all languages',
        dataProperties: 'Data Properties',
        typeClass: 'Class',
        typeIndividual: 'Individual',
        typeProperty: 'Property',
        typeDBpedia: 'DBpedia Resource',
        localSource: '💾 Source: Local Ontology',
        errorSearch: 'An error occurred while searching',
        errorDetails: 'Error loading details',
        pageTitle: 'Search Engine - Artificial Intelligence Ontology',
        headerTitle: 'Ontological Search Engine'
    },
    de: {
        subtitle: 'Künstliche Intelligenz — Lokale Ontologie + Mehrsprachiges DBpedia',
        searchTitle: 'In der Ontologie suchen',
        langHintPrefix: 'Suchsprache',
        searchPlaceholder: 'z.B. maschinelles Lernen, neuronales Netz, NLP...',
        searchBtn: 'Suchen',
        filterAll: 'Alle',
        filterClass: 'Klassen',
        filterProperty: 'Eigenschaften',
        filterIndividual: 'Individuen',
        resultsFound: 'Ergebnisse gefunden',
        noResults: 'Keine Ergebnisse gefunden',
        noResultsMsg: 'Versuche andere Suchbegriffe',
        loading: 'Suche läuft...',
        parents: 'Oberklassen',
        subclasses: 'Unterklassen',
        domain: 'Domäne',
        range: 'Wertebereich',
        classes: 'Klassen',
        instances: 'Instanzen',
        statClasses: 'Klassen',
        statProperties: 'Eigenschaften',
        statIndividuals: 'Individuen',
        offlineResults: 'Lokale Ergebnisse',
        onlineResults: 'Online-Ergebnisse',
        viewOnDBpedia: 'Auf DBpedia ansehen',
        dbpediaMultilingual: 'Mehrsprachiges DBpedia (EN, ES, DE, FR, JA)',
        dbpediaAllLabel: 'DBpedia in allen Sprachen durchsuchen',
        dbpediaScopeSingle: 'DBpedia auf',
        dbpediaScopeAll: 'DBpedia in allen Sprachen',
        dataProperties: 'Dateneigenschaften',
        typeClass: 'Klasse',
        typeIndividual: 'Individuum',
        typeProperty: 'Eigenschaft',
        typeDBpedia: 'DBpedia-Ressource',
        localSource: '💾 Quelle: Lokale Ontologie',
        errorSearch: 'Bei der Suche ist ein Fehler aufgetreten',
        errorDetails: 'Fehler beim Laden der Details',
        pageTitle: 'Suchmaschine - Ontologie der Künstlichen Intelligenz',
        headerTitle: 'Ontologische Suchmaschine'
    },
    fr: {
        subtitle: "Intelligence Artificielle — Ontologie Locale + DBpedia Multilingue",
        searchTitle: "Rechercher dans l'Ontologie",
        langHintPrefix: 'Langue de recherche',
        searchPlaceholder: 'Ex: apprentissage automatique, réseau neuronal, NLP...',
        searchBtn: 'Rechercher',
        filterAll: 'Tous',
        filterClass: 'Classes',
        filterProperty: 'Propriétés',
        filterIndividual: 'Individus',
        resultsFound: 'résultats trouvés',
        noResults: 'Aucun résultat trouvé',
        noResultsMsg: "Essayez d'autres termes de recherche",
        loading: 'Recherche en cours...',
        parents: 'Superclasses',
        subclasses: 'Sous-classes',
        domain: 'Domaine',
        range: 'Portée',
        classes: 'Classes',
        instances: 'Instances',
        statClasses: 'Classes',
        statProperties: 'Propriétés',
        statIndividuals: 'Individus',
        offlineResults: 'Résultats locaux',
        onlineResults: 'Résultats en ligne',
        viewOnDBpedia: 'Voir sur DBpedia',
        dbpediaMultilingual: 'DBpedia Multilingue (EN, ES, DE, FR, JA)',
        dbpediaAllLabel: 'Rechercher DBpedia dans toutes les langues',
        dbpediaScopeSingle: 'DBpedia en',
        dbpediaScopeAll: 'DBpedia dans toutes les langues',
        dataProperties: 'Propriétés de données',
        typeClass: 'Classe',
        typeIndividual: 'Individu',
        typeProperty: 'Propriété',
        typeDBpedia: 'Ressource DBpedia',
        localSource: '💾 Source: Ontologie locale',
        errorSearch: "Une erreur s'est produite lors de la recherche",
        errorDetails: 'Erreur lors du chargement des détails',
        pageTitle: "Moteur de Recherche - Ontologie de l'Intelligence Artificielle",
        headerTitle: 'Moteur de Recherche Ontologique'
    },
    ja: {
        subtitle: '人工知能 — ローカルオントロジー + 多言語DBpedia',
        searchTitle: 'オントロジーを検索',
        langHintPrefix: '検索言語',
        searchPlaceholder: '例: 機械学習, ニューラルネットワーク, NLP...',
        searchBtn: '検索',
        filterAll: 'すべて',
        filterClass: 'クラス',
        filterProperty: 'プロパティ',
        filterIndividual: '個体',
        resultsFound: '件の結果が見つかりました',
        noResults: '結果が見つかりませんでした',
        noResultsMsg: '別の検索語を試してください',
        loading: '検索中...',
        parents: 'スーパークラス',
        subclasses: 'サブクラス',
        domain: 'ドメイン',
        range: '値域',
        classes: 'クラス',
        instances: 'インスタンス',
        statClasses: 'クラス',
        statProperties: 'プロパティ',
        statIndividuals: '個体',
        offlineResults: 'ローカル結果',
        onlineResults: 'オンライン結果',
        viewOnDBpedia: 'DBpediaで見る',
        dbpediaMultilingual: '多言語DBpedia (EN, ES, DE, FR, JA)',
        dbpediaAllLabel: 'すべての言語でDBpediaを検索',
        dbpediaScopeSingle: 'DBpedia（言語:',
        dbpediaScopeAll: 'すべての言語のDBpedia',
        dataProperties: 'データプロパティ',
        typeClass: 'クラス',
        typeIndividual: '個体',
        typeProperty: 'プロパティ',
        typeDBpedia: 'DBpediaリソース',
        localSource: '💾 ソース: ローカルオントロジー',
        errorSearch: '検索中にエラーが発生しました',
        errorDetails: '詳細の読み込み中にエラーが発生しました',
        pageTitle: '検索エンジン - 人工知能オントロジー',
        headerTitle: 'オントロジー検索エンジン'
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

    // Update page title and html lang attribute
    document.title = t.pageTitle;
    document.documentElement.lang = lang;

    // Update UI text
    document.getElementById('headerTitle').textContent = t.headerTitle;
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

    // Re-renderizar stats con el nuevo idioma usando datos cacheados (sin peticion de red)
    // Esto evita que loadStats() y performSearch() accedan a la ontologia simultaneamente
    // y causen fallos en endpoints lentos como DBpedia DE/FR
    if (cachedStatsData) {
        renderStats(cachedStatsData);
    }
}

function onDbpediaAllChange() {
    dbpediaAllLangs = document.getElementById('dbpediaAllLangs').checked;
    const query = document.getElementById('searchInput').value;
    if (query) {
        performSearch();
    }
}

function setSearchMode(mode) {
    searchMode = mode === 'offline' ? 'offline' : 'online';
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === searchMode) {
            btn.classList.add('active');
        }
    });

    const dbpediaToggle = document.getElementById('dbpediaAllLangs');
    if (dbpediaToggle) {
        dbpediaToggle.disabled = searchMode === 'offline';
    }

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

function renderStats(data) {
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
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        cachedStatsData = data;
        renderStats(data);
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
        const onlineParam = searchMode === 'online' ? 'true' : 'false';
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&lang=${currentLang}&type=${currentFilter}&online=${onlineParam}${dbpediaAllParam}`);
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
        if (!data.online_enabled) {
            document.getElementById('sourceStats').innerHTML = `
                <span class="source-stat source-offline">${data.statistics.offline} ${t.offlineResults}</span>
            `;
        }

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
        const tErr = getTranslations(currentLang);
        results.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">⚠️</div>
                <h3>Error</h3>
                <p>${tErr.errorSearch}</p>
            </div>
        `;
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getLocalizedType(apiType, t) {
    switch (apiType) {
        case 'Clase': return { label: t.typeClass, css: 'type-class' };
        case 'Individuo': return { label: t.typeIndividual, css: 'type-individual' };
        case 'Propiedad': return { label: t.typeProperty, css: 'type-property' };
        default: return { label: t.typeDBpedia, css: 'type-dbpedia' };
    }
}

function createResultCard(result) {
    const t = getTranslations(currentLang);
    const { label: typeLabel, css: typeClass } = getLocalizedType(result.type, t);

    const langBadge = result.dbpedia_lang ?
        `<span class="source-badge source-online-badge">${result.dbpedia_lang.toUpperCase()}</span>` : '';

    const sourceBadge = result.source === 'online' ?
        `<span class="source-badge source-online-badge">🌐 Online</span>${langBadge}` :
        '<span class="source-badge source-offline-badge">💾 Offline</span>';

    let relations = '';

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

    // Data properties: show up to 3 in the card
    let dataPropsHtml = '';
    if (result.data_properties && Object.keys(result.data_properties).length > 0) {
        const entries = Object.entries(result.data_properties).slice(0, 3);
        const items = entries.map(([propLabel, values]) => {
            const val = values[0].value;
            const truncated = val.length > 80 ? val.slice(0, 77) + '…' : val;
            return `<span class="data-prop-tag"><strong>${escapeHtml(propLabel)}:</strong> ${escapeHtml(truncated)}</span>`;
        }).join('');
        dataPropsHtml = `<div class="result-data-props">${items}</div>`;
    }

    const dbpediaLang = result.dbpedia_lang || '';

    return `
        <div class="result-card" data-name="${encodeURIComponent(result.name)}" data-source="${result.source}" data-dbpedia-lang="${dbpediaLang}" onclick="handleResultClick(this)">
            <div class="result-header">
                <div>
                    <div class="result-title">${result.label} ${sourceBadge}</div>
                </div>
                <span class="result-type ${typeClass}">${typeLabel}</span>
            </div>
            <div class="result-comment">${result.comment}</div>
            ${relations ? `<div class="result-relations">${relations}</div>` : ''}
            ${dataPropsHtml}
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

        const { label: detailTypeLabel, css: detailTypeCss } = getLocalizedType(data.type, t);
        let detailHtml = `
            <div class="detail-section">
                <div class="detail-title">${data.label}</div>
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px; flex-wrap: wrap;">
                    <span class="result-type ${detailTypeCss}">${detailTypeLabel}</span>
                    ${data.source === 'online' ?
                `<span class="source-badge source-online-badge">🌐 DBpedia ${data.dbpedia_source || data.dbpedia_lang || ''}</span>` :
                `<span class="source-badge source-offline-badge">${t.localSource}</span>`}
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
        if (data.data_properties && Object.keys(data.data_properties).length > 0) {
            const rows = Object.entries(data.data_properties).map(([propLabel, values]) => {
                const displayVal = values[0].value;
                const langTag = values[0].lang && values[0].lang !== currentLang ? `<span class="data-prop-lang">${values[0].lang}</span>` : '';
                return `<tr>
                    <td class="dp-label">${escapeHtml(propLabel)}</td>
                    <td class="dp-value">${escapeHtml(displayVal)} ${langTag}</td>
                </tr>`;
            }).join('');
            detailHtml += `
                <div class="detail-section">
                    <div class="detail-label">${t.dataProperties}:</div>
                    <table class="data-props-table">${rows}</table>
                </div>
            `;
        }
        content.innerHTML = detailHtml;
    } catch (error) {
        console.error('Error loading details:', error);
        const tErr = getTranslations(currentLang);
        content.innerHTML = `<p>${tErr.errorDetails}</p>`;
    }
}

function getTypeClass(type) {
    if (type === 'Clase') return 'type-class';
    if (type === 'Individuo') return 'type-individual';
    if (type === 'Propiedad') return 'type-property';
    return 'type-dbpedia';
}

function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
}

window.onclick = function (event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});

loadStats();
updateLangHint();
setSearchMode(searchMode);
