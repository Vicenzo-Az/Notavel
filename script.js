// Seleção de elementos
const loginPage = document.getElementById('login-page');
const mainContainer = document.querySelector('.main-container');
const loginForm = document.getElementById('login-form');
const menuButton = document.getElementById('menu-button');
const menuOptions = document.getElementById('menu-options');
const saveOption = document.getElementById('save-option');
const importOption = document.getElementById('import-option');
const duplicateOption = document.getElementById('duplicate-option');
const exportOption = document.getElementById('export-option');
const noteList = document.querySelector('.note-list');
const noteEditor = document.getElementById('note-editor');
const notePlaceholder = document.getElementById('note-placeholder');
const noteTitle = document.getElementById('note-title');
const noteBody = document.getElementById('note-body');
const saveNoteButton = document.getElementById('save-note-button');
const deleteNoteButton = document.getElementById('delete-note-button');
const newNoteButton = document.getElementById('new-note-button');

// State management
let notes = []; // Lista inicial de notas vazia
let currentNoteId = null; // Nenhuma nota selecionada inicialmente

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    renderNotes(); // Renderiza as notas existentes (inicialmente vazio)
    closeEditor(); // Fecha o editor ao carregar a página
});

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginPage.style.display = 'none';
    mainContainer.style.display = 'flex';
});

// Create a new note
newNoteButton.addEventListener('click', () => {
    const newNote = {
        id: Date.now(),
        title: 'Nova Nota',
        content: ''
    };
    notes.push(newNote);
    currentNoteId = newNote.id; // Define a nova nota como selecionada
    renderNotes();
    openEditor(newNote);
});

// Save the current note
saveNoteButton.addEventListener('click', () => {
    const titleInput = document.getElementById('note-title');
    const bodyInput = document.getElementById('note-body');

    const note = notes.find(note => note.id === currentNoteId);
    if (note) {
        note.title = titleInput.value;
        note.content = bodyInput.value;
        renderNotes();
    }
});

// Salvar nota atual
saveOption.addEventListener('click', () => {
    if (!currentNoteId) {
        alert('Nenhuma nota aberta para salvar.');
        return;
    }

    const note = notes.find(note => note.id === currentNoteId);
    if (note) {
        const titleInput = document.getElementById('note-title');
        const bodyInput = document.getElementById('note-body');

        note.title = titleInput.value;
        note.content = bodyInput.value;
        renderNotes(); // Atualiza a lista de notas
        alert('Nota salva com sucesso!');
    }
});

// Mostrar/esconder menu de opções
menuButton.addEventListener('click', (e) => {
    menuOptions.classList.toggle('hidden');
    e.stopPropagation(); // Impede o evento de propagação para o documento
});

// Fechar menu ao clicar fora
document.addEventListener('click', () => {
    menuOptions.classList.add('hidden');
});

// Impede que clique no menu feche-o
menuOptions.addEventListener('click', (e) => e.stopPropagation());

// Função para extrair texto do PDF
async function extractTextFromPDF(file) {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            try {
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                let pdfText = '';

                // Extrair texto de todas as páginas do PDF
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' '); // Juntar o texto
                    pdfText += pageText + '\n'; // Adicionar o conteúdo da página com uma quebra de linha
                }

                resolve(pdfText); // Retorna o texto extraído
            } catch (error) {
                reject('Erro ao ler o PDF');
            }
        };

        reader.onerror = () => reject('Erro ao ler o arquivo');
        reader.readAsArrayBuffer(file);  // Lê o arquivo como um ArrayBuffer
    });
}

// Importar PDF
importOption.addEventListener('click', () => {
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = '.pdf';

    inputFile.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const pdfText = await extractTextFromPDF(file);

                // Criar a nota com o texto extraído do PDF
                const importedNote = {
                    id: Date.now(),
                    title: `Importado: ${file.name}`,
                    content: pdfText
                };

                // Adicionar a nova nota à lista de notas
                notes.push(importedNote);
                renderNotes();
            } catch (error) {
                console.error(error);
                alert(error);
            }
        }
    });

    inputFile.click();
});

// Open editor for a note and preserve line breaks
function openEditor(note) {
    currentNoteId = note.id;
    noteEditor.querySelector('#note-title').value = note.title;

    // Substituir \n por <br> para preservar as quebras de linha
    noteEditor.querySelector('#note-body').innerHTML = note.content.replace(/\n/g, '<br>');

    notePlaceholder.style.display = 'none'; // Esconde o placeholder
    noteEditor.style.display = 'flex'; // Mostra o editor
}

// Duplicar nota selecionada
duplicateOption.addEventListener('click', () => {
    if (!currentNoteId) {
        alert('Selecione uma nota para duplicar.');
        return;
    }

    const currentNote = notes.find(note => note.id === currentNoteId);
    if (currentNote) {
        const duplicatedNote = { ...currentNote, id: Date.now() }; // Cria uma nova nota com id único
        notes.push(duplicatedNote);
        renderNotes();
    }
});

// Exportar uma única nota para PDF
exportOption.addEventListener('click', () => {
    if (!currentNoteId) {
        alert('Nenhuma nota aberta para exportar.');
        return;
    }

    const note = notes.find(note => note.id === currentNoteId);
    if (!note) {
        alert('Erro ao encontrar a nota.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageMargin = 10;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Ajuste do cálculo da largura máxima disponível para o conteúdo
    const maxLineWidth = pageWidth - 2 * pageMargin; // Largura máxima para o texto
    let currentY = pageMargin + 10; // Começar a escrever na parte superior da página, abaixo da margem

    // Título
    doc.setFontSize(24);
    const titleLines = doc.splitTextToSize(note.title, maxLineWidth); // Quebra o título se for muito longo
    titleLines.forEach((line) => {
        if (currentY + 10 > pageHeight - pageMargin) {
            doc.addPage(); // Adicionar uma nova página se o conteúdo ultrapassar o limite da página
            currentY = pageMargin + 10;
        }
        doc.text(line, pageMargin, currentY);
        currentY += 10; // Distância após o título
    });

    // Ajuste do conteúdo
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(note.content, maxLineWidth); // Quebra o conteúdo em linhas ajustadas

    // Adicionar o conteúdo ao PDF
    lines.forEach((line) => {
        // Verifica se o conteúdo ultrapassará a margem inferior
        if (currentY + 10 > pageHeight - pageMargin) {
            doc.addPage(); // Adicionar uma nova página se o conteúdo ultrapassar o limite da página
            currentY = pageMargin + 10; // Resetar a posição vertical
        }
        
        // Renderizar o texto
        doc.text(line, pageMargin, currentY);

        // Aumentar o Y para a próxima linha
        currentY += 10; // Distância entre as linhas
    });

    // Salvar o PDF com o nome adequado
    doc.save(`${note.title || 'nota'}.pdf`); // Salva o arquivo com o título ou "nota" como padrão
});


// Render notes in the sidebar
function renderNotes() {
    noteList.innerHTML = '';

    if (notes.length === 0) {
        const noNotesMessage = document.createElement('p');
        noNotesMessage.textContent = 'Nenhuma nota disponível. Crie uma nova nota para começar!';
        noNotesMessage.style.color = '#666';
        noNotesMessage.style.textAlign = 'center';
        noNotesMessage.style.padding = '20px';
        noteList.appendChild(noNotesMessage);
        closeEditor(); // Fecha o editor se não houver notas
        return;
    }

    notes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.classList.add('note-item');
        noteItem.dataset.id = note.id;

        const notePreview = document.createElement('div');
        notePreview.classList.add('note-preview');
        notePreview.innerHTML = `<h4 class="note-title">${note.title}</h4><p class="note-content">${note.content.substring(0, 50)}...</p>`;

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-note');
        deleteButton.textContent = '🗑️';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita a abertura do editor ao clicar no botão de deletar
            deleteNote(note.id);
        });

        noteItem.appendChild(notePreview);
        noteItem.appendChild(deleteButton);

        noteItem.addEventListener('click', () => openEditor(note));

        noteList.appendChild(noteItem);
    });
}

// Open editor for a note
function openEditor(note) {
    currentNoteId = note.id;
    noteEditor.querySelector('#note-title').value = note.title;
    noteEditor.querySelector('#note-body').value = note.content;

    notePlaceholder.style.display = 'none'; // Esconde o placeholder
    noteEditor.style.display = 'flex'; // Mostra o editor
}

// Close the editor
function closeEditor() {
    currentNoteId = null; // Nenhuma nota está selecionada
    noteEditor.style.display = 'none'; // Esconde o editor
    notePlaceholder.style.display = 'flex'; // Mostra o placeholder
}

// Delete a note
function deleteNote(noteId) {
    notes = notes.filter(note => note.id !== noteId);
    if (currentNoteId === noteId) {
        closeEditor(); // Fecha o editor se a nota deletada estava ativa
    }
    renderNotes();
}

document.addEventListener('DOMContentLoaded', function() {
    const profileButton = document.querySelector('.header-right .profile-circle');
    const popup = document.querySelector('.account-popup');
    const closePopupBtn = document.querySelector('.close-popup-btn');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const changeNamePasswordBtn = document.getElementById('change-name-password-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Abrir o popup ao clicar na foto do perfil
    profileButton.addEventListener('click', function() {
        popup.style.display = 'flex';
    });

    // Fechar o popup
    closePopupBtn.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    // Funcionalidade para trocar a foto de perfil
    changePhotoBtn.addEventListener('click', function() {
        // Aqui você pode adicionar a lógica para trocar a foto
        alert('Trocar Foto de Perfil');
    });

    // Funcionalidade para trocar nome e senha
    changeNamePasswordBtn.addEventListener('click', function() {
        // Aqui você pode abrir um formulário ou lógica para trocar nome e senha
        alert('Trocar Nome e Senha');
    });

// Event listener para o botão de logout
logoutBtn.addEventListener('click', () => {
    // Ocultar a página principal e exibir a página de login
    mainContainer.style.display = 'none';
    loginPage.style.display = 'flex';
});
});
