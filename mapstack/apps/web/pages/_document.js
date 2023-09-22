/* eslint-disable react/no-unknown-property */
/* eslint-disable @next/next/no-styled-jsx-in-document */
import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheets } from '@mui/styles'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head key='_document'>
          <meta
            name='application-name'
            content='mapstack'
          />
          <meta
            name='apple-mobile-web-app-title'
            content='mapstack'
          />
          <meta
            name='format-detection'
            content='telephone=no'
          />
          <meta
            name='msapplication-TileColor'
            content='#2B5797'
          />
          <meta
            name='msapplication-tap-highlight'
            content='no'
          />
          <link
            rel='apple-touch-icon'
            sizes='180x180'
            href='/icons/apple-touch-icon.png'
          />
          <link
            rel='icon'
            type='image/png'
            sizes='32x32'
            href='/icons/favicon-32x32.png'
          />
          <link
            rel='icon'
            type='image/png'
            sizes='16x16'
            href='/icons/favicon-16x16.png'
          />
          <link
            rel='icon'
            href='/icons/mapstack.svg'
            type='image/svg+xml'
          />
          <link
            rel='shortcut icon'
            href='/icons/favicon.ico'
          />
          <link
            rel='manifest'
            href='/manifest.json'
          />
          <link
            rel='preconnect'
            href='https://fonts.googleapis.com'
          />
          <link
            rel='preconnect'
            href='https://fonts.gstatic.com'
            crossOrigin='true'
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;900&display=swap'
            rel='stylesheet'
          />
          <link
            href='https://unpkg.com/maplibre-gl@3.1.0/dist/maplibre-gl.css'
            rel='stylesheet'
          />
        </Head>

        <style
          jsx
          global
        >{`
          html {
            scroll-behavior: smooth;
          }
        `}</style>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with server-side generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets()
  const originalRenderPage = ctx.renderPage

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => sheets.collect(<App {...props} />)
    })

  const initialProps = await Document.getInitialProps(ctx)

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [
      ...React.Children.toArray(initialProps.styles),
      sheets.getStyleElement()
    ]
  }
}

export default MyDocument
