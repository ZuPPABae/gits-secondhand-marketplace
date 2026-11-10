<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name', 'Marketplace Barang Bekas') }}</title>
        <style>
            body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
            .container { text-align: center; }
            h1 { color: #1e293b; font-size: 2rem; margin-bottom: 0.5rem; }
            p { color: #64748b; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>{{ config('app.name', 'Marketplace Barang Bekas') }}</h1>
            <p>Laravel {{ app()->version() }}</p>
        </div>
    </body>
</html>
