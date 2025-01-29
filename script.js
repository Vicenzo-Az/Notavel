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
    fetchNotes(); // Carrega as notas do servidor
    closeEditor(); // Fecha o editor ao carregar a página
});

// Fetch notes from the server
async function fetchNotes() {
    try {
        const response = await fetch('notes.php');
        notes = await response.json();
        renderNotes();
    } catch (error) {
        console.error('Erro ao carregar notas:', error);
    }
}

// Create a new note
newNoteButton.addEventListener('click', async () => {
    try {
        const response = await fetch('notes.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `title=Nova Nota&content=`
        });
        
        if (response.ok) {
            await fetchNotes(); // Recarrega as notas após criar uma nova
        } else {
            throw new Error('Erro ao criar nota');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar nova nota');
    }
});

// Save the current note
saveNoteButton.addEventListener('click', async () => {
    if (!currentNoteId) return;

    const titleInput = document.getElementById('note-title');
    const bodyInput = document.getElementById('note-body');

    try {
        const response = await fetch('notes.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `id=${currentNoteId}&title=${encodeURIComponent(titleInput.value)}&content=${encodeURIComponent(bodyInput.value)}`
        });

        if (response.ok) {
            await fetchNotes(); // Recarrega as notas após salvar
            alert('Nota salva com sucesso!');
        } else {
            throw new Error('Erro ao salvar nota');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar nota');
    }
});

// Salvar nota atual
saveOption.addEventListener('click', async () => {
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

        try {
            const response = await fetch('notes.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `id=${note.id}&title=${encodeURIComponent(note.title)}&content=${encodeURIComponent(note.content)}`
            });
            const result = await response.text();
            alert(result);
            renderNotes(); // Atualiza a lista de notas
        } catch (error) {
            console.error('Erro ao salvar nota:', error);
        }
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
function renderNotes(filteredNotes = notes) {
    noteList.innerHTML = '';

    if (filteredNotes.length === 0) {
        const noNotesMessage = document.createElement('p');
        noNotesMessage.textContent = 'Nenhuma nota disponível. Crie uma nova nota para começar!';
        noNotesMessage.style.color = '#666';
        noNotesMessage.style.textAlign = 'center';
        noNotesMessage.style.padding = '20px';
        noteList.appendChild(noNotesMessage);
        closeEditor(); // Fecha o editor se não houver notas
        return;
    }

    filteredNotes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.classList.add('note-item');
        noteItem.dataset.id = note.id;

        const notePreview = document.createElement('div');
        notePreview.classList.add('note-preview');
        notePreview.innerHTML = `
            <h4 class="note-title">${note.title}</h4>
            <p class="note-content">${note.content.substring(0, 50)}...</p>
            <p class="note-date">Modificado em: ${new Date(note.updated_at).toLocaleString()}</p>
        `;

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-note');
        deleteButton.textContent = '🗑️';
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation(); // Evita a abertura do editor ao clicar no botão de deletar
            await deleteNote(note.id);
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
async function deleteNote(noteId) {
    try {
        const response = await fetch('notes.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `id=${noteId}`
        });

        if (response.ok) {
            if (currentNoteId === noteId) {
                closeEditor();
            }
            await fetchNotes(); // Recarrega as notas após deletar
        } else {
            throw new Error('Erro ao deletar nota');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao deletar nota');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const profileButton = document.querySelector('.header-right .profile-circle');
    const popup = document.querySelector('.account-popup');
    const closePopupBtn = document.querySelector('.close-popup-btn');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const changeNamePasswordBtn = document.getElementById('change-name-password-btn');
    const saveNamePasswordBtn = document.getElementById('save-name-password-btn');
    const namePasswordFields = document.getElementById('name-password-fields');
    const logoutBtn = document.getElementById('logout-btn');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.createElement('input');

    // Abrir o popup ao clicar na foto do perfil
    profileButton.addEventListener('click', function() {
        popup.style.display = 'flex';
    });

    // Fechar o popup
    closePopupBtn.addEventListener('click', function() {
        popup.style.display = 'none';
    });

    // Mostrar campos de nome e senha ao clicar no botão "Trocar Nome e Senha"
    changeNamePasswordBtn.addEventListener('click', function() {
        namePasswordFields.classList.toggle('hidden');
    });

    // Funcionalidade para trocar a foto de perfil
    changePhotoBtn.addEventListener('click', function() {
        document.getElementById('profile-photo').click();
    });

    document.getElementById('profile-photo').addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profile_photo', file);

            try {
                const response = await fetch('upload_photo.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.status === 'success') {
                    const newPhotoUrl = 'uploads/' + result.fileName;
                    document.getElementById('current-photo').src = newPhotoUrl;
                    document.getElementById('current-photo-popup').src = newPhotoUrl;
                    alert('Foto de perfil atualizada com sucesso!');
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao atualizar foto de perfil');
            }
        }
    });

    // Funcionalidade para salvar nome e senha
    saveNamePasswordBtn.addEventListener('click', async function() {
        const newUsername = document.getElementById('new-username').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        try {
            const response = await fetch('update_user.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `username=${newUsername}&password=${newPassword}`
            });
            const result = await response.text();
            alert(result);
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao atualizar dados do usuário');
        }
    });

    // Event listener para o botão de logout
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('logout.php');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Erro:', error);
        }
    });

    // Adicionar campo de pesquisa ao clicar no botão de pesquisa
    searchButton.addEventListener('click', () => {
        if (!searchInput.parentNode) {
            searchInput.type = 'text';
            searchInput.placeholder = 'Pesquisar notas...';
            searchInput.style.marginLeft = '10px';
            searchButton.parentNode.insertBefore(searchInput, searchButton.nextSibling);
        }
        searchInput.classList.toggle('hidden');
        searchInput.focus();
    });

    // Filtrar notas ao digitar no campo de pesquisa
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filteredNotes = notes.filter(note => note.title.toLowerCase().includes(query));
        renderNotes(filteredNotes);
    });
});
