import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [formattedBooks, setFormattedBooks] = useState({})
  const [selectedBook, setSelectedBook] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  useEffect(() => {
    // Load AdSense script
    const script = document.createElement('script')
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID'
    script.async = true
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Kindle Notes Formatter",
      "description": "Format your Kindle notes and highlights into beautiful markdown files. Organize your book notes, download them, or copy to clipboard.",
      "applicationCategory": "Utility",
      "operatingSystem": "Any",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }

    const scriptTag = document.createElement('script')
    scriptTag.type = 'application/ld+json'
    scriptTag.text = JSON.stringify(structuredData)
    document.head.appendChild(scriptTag)

    return () => {
      document.head.removeChild(script)
      document.head.removeChild(scriptTag)
    }
  }, [])

  const formatNotes = (text) => {
    // Split the text into individual clippings
    const clippings = text.split('==========')
    const books = {}

    clippings.forEach(clipping => {
      const lines = clipping.trim().split('\n')
      
      if (lines.length < 3) return // Skip empty clippings

      // First line contains book title and author
      const bookInfo = lines[0].trim()
      
      if (!books[bookInfo]) {
        books[bookInfo] = []
      }

      // Second line contains page and date info
      const pageInfo = lines[1].trim()
      
      // The rest is the highlight content
      const highlight = lines.slice(2).join('\n').trim()
      
      if (highlight) {
        books[bookInfo].push({
          pageInfo,
          highlight
        })
      }
    })

    return books
  }

  const formatBookToMarkdown = (bookTitle, clippings) => {
    let formattedLines = [`# ${bookTitle}\n\n`]
    
    clippings.forEach(({ pageInfo, highlight }) => {
      formattedLines.push(`*${pageInfo}*\n`)
      formattedLines.push(`> ${highlight}\n\n`)
    })

    return formattedLines.join('')
  }

  const handleInputChange = (e) => {
    const text = e.target.value
    setInputText(text)
    const books = formatNotes(text)
    setFormattedBooks(books)
    // Select the first book by default
    if (Object.keys(books).length > 0 && !selectedBook) {
      setSelectedBook(Object.keys(books)[0])
    }
  }

  const handleDownload = (bookTitle) => {
    const element = document.createElement('a')
    const formattedText = formatBookToMarkdown(bookTitle, formattedBooks[bookTitle])
    const file = new Blob([formattedText], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = `${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleCopyToClipboard = (bookTitle) => {
    const formattedText = formatBookToMarkdown(bookTitle, formattedBooks[bookTitle])
    navigator.clipboard.writeText(formattedText)
      .then(() => {
        setCopyStatus('Copied!')
        setTimeout(() => setCopyStatus(''), 2000)
      })
      .catch(err => {
        console.error('Failed to copy text: ', err)
        setCopyStatus('Failed to copy')
        setTimeout(() => setCopyStatus(''), 2000)
      })
  }

  return (
    <main className="app-container">
      <header>
        <div className="top-ad-container">
          <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
            data-ad-slot="YOUR_TOP_AD_SLOT"
            data-ad-format="auto"
            data-full-width-responsive="true">
          </ins>
        </div>

        <h1>Kindle Notes Formatter</h1>
        <p className="subtitle">Convert your Kindle notes and highlights into beautiful markdown files</p>
      </header>

      <section className="input-container">
        <label htmlFor="kindle-notes" className="visually-hidden">Paste your Kindle notes here</label>
        <textarea
          id="kindle-notes"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Paste your Kindle clippings here..."
          rows={10}
          aria-label="Kindle notes input"
        />
      </section>
      
      {Object.keys(formattedBooks).length > 0 && (
        <section className="books-container">
          <aside className="left-ad-container">
            <ins className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
              data-ad-slot="YOUR_LEFT_AD_SLOT"
              data-ad-format="auto"
              data-full-width-responsive="true">
            </ins>
          </aside>

          <div className="main-content">
            <nav className="books-sidebar" aria-label="Books navigation">
              <h2>Books</h2>
              <ul>
                {Object.keys(formattedBooks).map(bookTitle => (
                  <li 
                    key={bookTitle}
                    className={selectedBook === bookTitle ? 'selected' : ''}
                    onClick={() => setSelectedBook(bookTitle)}
                  >
                    {bookTitle}
                  </li>
                ))}
              </ul>
            </nav>
            
            <article className="preview-container">
              {selectedBook && (
                <>
                  <header className="preview-header">
                    <h2>{selectedBook}</h2>
                    <div className="button-group">
                      <button 
                        onClick={() => handleDownload(selectedBook)}
                        className="download-button"
                        aria-label="Download notes"
                      >
                        Download Notes
                      </button>
                      <button 
                        onClick={() => handleCopyToClipboard(selectedBook)}
                        className="copy-button"
                        aria-label="Copy to clipboard"
                      >
                        {copyStatus || 'Copy to Clipboard'}
                      </button>
                    </div>
                  </header>
                  <pre>{formatBookToMarkdown(selectedBook, formattedBooks[selectedBook])}</pre>
                </>
              )}
            </article>
          </div>

          <aside className="right-ad-container">
            <ins className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
              data-ad-slot="YOUR_RIGHT_AD_SLOT"
              data-ad-format="auto"
              data-full-width-responsive="true">
            </ins>
          </aside>
        </section>
      )}
    </main>
  )
}

export default App
