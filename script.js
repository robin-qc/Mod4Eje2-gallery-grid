// Variables globales
let currentFilter = 'all';
let currentView = 'grid';
let likedPhotos = new Set();
let gridSize = 250;
let gridGap = 1.5;

/**
 * Inicializar la aplicación
 */
document.addEventListener('DOMContentLoaded', () => {
    // Cargar fotos guardadas
    loadLikedPhotos();
    updateStats();
    
    // Inicializar controles
    initFilters();
    initViewControls();
    initGridControls();
    initGalleryInteractions();
    initDemoControls();
    initModals();
    initUpload();
    
    // Animaciones iniciales
    animateGalleryItems();
});

/**
 * Sistema de filtrado
 */
function initFilters() {
    const filterButtons = document.querySelectorAll('.btn-filter');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir clase active al botón clicado
            button.classList.add('active');
            
            // Actualizar filtro actual
            currentFilter = button.dataset.filter;
            
            // Filtrar galería
            filterGallery();
            
            // Actualizar estadísticas
            updateStats();
        });
    });
}

function filterGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const totalItems = galleryItems.length;
    let visibleCount = 0;
    
    galleryItems.forEach(item => {
        const category = item.dataset.category;
        
        if (currentFilter === 'all' || category === currentFilter) {
            item.style.display = 'flex';
            item.style.animation = 'fadeIn 0.5s ease';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Actualizar contador
    document.getElementById('totalPhotos').textContent = visibleCount;
    
    // Mostrar mensaje si no hay resultados
    showNoResultsMessage(visibleCount === 0);
}

/**
 * Sistema de vistas
 */
function initViewControls() {
    const viewButtons = document.querySelectorAll('.btn-view');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones
            viewButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir clase active al botón clicado
            button.classList.add('active');
            
            // Actualizar vista actual
            currentView = button.dataset.view;
            
            // Aplicar vista
            applyView();
        });
    });
}

function applyView() {
    const gallery = document.getElementById('gallery');
    
    switch(currentView) {
        case 'grid':
            gallery.style.gridTemplateColumns = `repeat(auto-fit, minmax(${gridSize}px, 1fr))`;
            gallery.style.gridAutoRows = '250px';
            break;
        case 'masonry':
            gallery.style.gridTemplateColumns = `repeat(auto-fill, minmax(${gridSize}px, 1fr))`;
            gallery.style.gridAutoRows = 'auto';
            break;
        case 'list':
            gallery.style.gridTemplateColumns = '1fr';
            gallery.style.gridAutoRows = 'auto';
            break;
    }
}

/**
 * Controles de grid interactivos
 */
function initGridControls() {
    const decreaseBtn = document.getElementById('decreaseGrid');
    const increaseBtn = document.getElementById('increaseGrid');
    const gridSizeElement = document.getElementById('gridSize');
    
    decreaseBtn.addEventListener('click', () => {
        if (gridSize > 150) {
            gridSize -= 25;
            updateGridSize();
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        if (gridSize < 350) {
            gridSize += 25;
            updateGridSize();
        }
    });
    
    function updateGridSize() {
        gridSizeElement.textContent = `${gridSize}px`;
        document.documentElement.style.setProperty('--grid-size', `${gridSize}px`);
        applyView();
    }
}

/**
 * Interacciones de la galería
 */
function initGalleryInteractions() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        // Botón de like
        const likeBtn = item.querySelector('.btn-like');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(item, likeBtn);
        });
        
        // Botones de acción
        const actionButtons = item.querySelectorAll('.btn-action');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.querySelector('i').className;
                
                if (action.includes('expand')) {
                    openImageModal(item);
                } else if (action.includes('download')) {
                    downloadImage(item);
                } else if (action.includes('share')) {
                    shareImage(item);
                }
            });
        });
        
        // Click en el item
        item.addEventListener('click', () => {
            openImageModal(item);
        });
    });
}

function toggleLike(item, button) {
    const isActive = button.classList.contains('active');
    const heartIcon = button.querySelector('i');
    
    if (isActive) {
        button.classList.remove('active');
        heartIcon.className = 'far fa-heart';
        likedPhotos.delete(item.dataset.id || item.querySelector('img').src);
    } else {
        button.classList.add('active');
        heartIcon.className = 'fas fa-heart';
        likedPhotos.add(item.dataset.id || item.querySelector('img').src);
        
        // Animación de like
        button.style.animation = 'pulse 0.3s ease';
        setTimeout(() => {
            button.style.animation = '';
        }, 300);
    }
    
    // Guardar en localStorage
    saveLikedPhotos();
    updateStats();
}

function loadLikedPhotos() {
    const saved = localStorage.getItem('likedPhotos');
    if (saved) {
        likedPhotos = new Set(JSON.parse(saved));
        
        // Aplicar likes guardados
        document.querySelectorAll('.gallery-item').forEach(item => {
            const imgSrc = item.querySelector('img').src;
            if (likedPhotos.has(imgSrc)) {
                const likeBtn = item.querySelector('.btn-like');
                likeBtn.classList.add('active');
                likeBtn.querySelector('i').className = 'fas fa-heart';
            }
        });
    }
}

function saveLikedPhotos() {
    localStorage.setItem('likedPhotos', JSON.stringify([...likedPhotos]));
}

/**
 * Demo interactiva
 */
function initDemoControls() {
    const gridSizeSlider = document.getElementById('gridSizeSlider');
    const gapSizeSlider = document.getElementById('gapSizeSlider');
    const featuredToggle = document.getElementById('featuredToggle');
    const gridSizeValue = document.getElementById('gridSizeValue');
    const gapSizeValue = document.getElementById('gapSizeValue');
    
    gridSizeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        gridSizeValue.textContent = `${value}px`;
        gridSize = parseInt(value);
        updateGridSize();
    });
    
    gapSizeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        gapSizeValue.textContent = `${value}rem`;
        gridGap = parseFloat(value);
        document.documentElement.style.setProperty('--grid-gap', `${gridGap}rem`);
        document.getElementById('gallery').style.gap = `${gridGap}rem`;
    });
    
    featuredToggle.addEventListener('change', (e) => {
        const showFeatured = e.target.checked;
        const featuredItems = document.querySelectorAll('.gallery-item.featured');
        
        featuredItems.forEach(item => {
            item.style.display = showFeatured ? 'flex' : 'none';
        });
    });
}

/**
 * Sistema de modales
 */
function initModals() {
    const imageModal = document.getElementById('imageModal');
    const modals = document.querySelectorAll('.modal');
    
    // Botones de cerrar
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            modals.forEach(modal => modal.classList.remove('active'));
            document.body.style.overflow = '';
        });
    });
    
    // Cerrar al hacer clic fuera
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => modal.classList.remove('active'));
            document.body.style.overflow = '';
        }
    });
}

function openImageModal(item) {
    const modal = document.getElementById('imageModal');
    const modalImage = modal.querySelector('img');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    
    const img = item.querySelector('img');
    const title = item.querySelector('h3').textContent;
    const description = item.querySelector('p').textContent;
    
    modalImage.src = img.src;
    modalImage.alt = img.alt;
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Sistema de subida
 */
function initUpload() {
    const uploadBtn = document.querySelector('.btn-upload');
    const uploadModal = document.getElementById('uploadModal');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadSubmit = document.querySelector('.btn-upload-submit');
    
    // Abrir modal de subida
    uploadBtn.addEventListener('click', () => {
        uploadModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--color-primary)';
        uploadArea.style.background = 'var(--color-bg)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#cbd5e0';
        uploadArea.style.background = '';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#cbd5e0';
        uploadArea.style.background = '';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileUpload(file);
        }
    });
    
    // Click para seleccionar
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Cambio en input de archivo
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });
    
    // Enviar formulario
    uploadSubmit.addEventListener('click', () => {
        const title = document.getElementById('photoTitle').value;
        const category = document.getElementById('photoCategory').value;
        
        if (!title || !category) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        // Simular subida
        uploadSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
        uploadSubmit.disabled = true;
        
        setTimeout(() => {
            alert('¡Foto subida exitosamente!');
            uploadModal.classList.remove('active');
            document.body.style.overflow = '';
            uploadSubmit.innerHTML = '<i class="fas fa-upload"></i> Subir Foto';
            uploadSubmit.disabled = false;
            
            // Resetear formulario
            document.getElementById('photoTitle').value = '';
            document.getElementById('photoCategory').value = '';
            fileInput.value = '';
        }, 2000);
    });
}

function handleFileUpload(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        uploadArea.innerHTML = `
            <div class="upload-preview">
                <img src="${e.target.result}" alt="Preview" style="max-width: 100px; border-radius: 8px;">
                <p>${file.name}</p>
            </div>
        `;
    };
    
    reader.readAsDataURL(file);
}

/**
 * Funciones de utilidad
 */
function downloadImage(item) {
    const img = item.querySelector('img');
    const link = document.createElement('a');
    link.href = img.src;
    link.download = img.alt.toLowerCase().replace(/\s+/g, '-') + '.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mostrar feedback
    showNotification('Descarga iniciada');
}

function shareImage(item) {
    const img = item.querySelector('img');
    const title = item.querySelector('h3').textContent;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: 'Mira esta increíble foto',
            url: img.src,
        });
    } else {
        // Fallback para navegadores sin soporte
        navigator.clipboard.writeText(img.src).then(() => {
            showNotification('Enlace copiado al portapapeles');
        });
    }
}

function updateStats() {
    const totalPhotos = document.querySelectorAll('.gallery-item').length;
    const featuredCount = document.querySelectorAll('.gallery-item[data-featured="true"]').length;
    const likedCount = likedPhotos.size;
    
    document.getElementById('totalPhotos').textContent = totalPhotos;
    document.getElementById('featuredCount').textContent = featuredCount;
    
    // Actualizar contador de likes si existe
    const likeStat = document.querySelector('.stat:nth-child(4)');
    if (!likeStat) {
        // Añadir stat de likes si no existe
        const statsContainer = document.querySelector('.header-stats');
        if (statsContainer.children.length < 4) {
            const likeStat = document.createElement('div');
            likeStat.className = 'stat';
            likeStat.innerHTML = `
                <span class="stat-number" id="likedCount">${likedCount}</span>
                <span class="stat-label">Likes</span>
            `;
            statsContainer.appendChild(likeStat);
        }
    } else {
        document.getElementById('likedCount').textContent = likedCount;
    }
}

function showNoResultsMessage(show) {
    let message = document.getElementById('noResultsMessage');
    
    if (show && !message) {
        message = document.createElement('div');
        message.id = 'noResultsMessage';
        message.className = 'no-results';
        message.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>No se encontraron fotos</h3>
            <p>Intenta con otra categoría o sube una nueva foto.</p>
        `;
        document.getElementById('gallery').parentNode.insertBefore(message, document.getElementById('gallery'));
    } else if (!show && message) {
        message.remove();
    }
}

function showNotification(text) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = text;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Animaciones
 */
function animateGalleryItems() {
    const items = document.querySelectorAll('.gallery-item');
    
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
}

/**
 * Botón de copiar código
 */
document.querySelectorAll('.btn-copy').forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.dataset.target;
        const codeElement = document.getElementById(targetId);
        const code = codeElement.textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copiado!';
            button.style.background = 'var(--color-success)';
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = '';
            }, 2000);
        });
    });
});

/**
 * Efectos hover mejorados
 */
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
        const img = item.querySelector('img');
        img.style.transform = 'scale(1.05)';
    });
    
    item.addEventListener('mouseleave', () => {
        const img = item.querySelector('img');
        img.style.transform = 'scale(1)';
    });
});

// Añadir estilos para notificación
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--color-primary);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1001;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }
    
    .no-results {
        text-align: center;
        padding: 4rem 2rem;
        background: var(--color-bg);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-xl);
    }
    
    .no-results i {
        font-size: 3rem;
        color: var(--color-text-light);
        margin-bottom: 1rem;
    }
    
    .no-results h3 {
        color: var(--color-text);
        margin-bottom: 0.5rem;
    }
    
    .no-results p {
        color: var(--color-text-light);
    }
    
    .upload-preview {
        text-align: center;
    }
    
    .upload-preview img {
        margin-bottom: 1rem;
    }
`;
document.head.appendChild(style);