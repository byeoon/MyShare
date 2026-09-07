const favicons = import.meta.glob('$lib/assets/favicon/*', {
    eager: true,
    query: '?url',
    import: 'default',
});

const icons = Object.entries(favicons).map(([path, url]) => {
    const filename = path.split('/').pop()!;

    if (filename.endsWith('.ico')) {
        return {
            href: url,
            type: 'image/x-icon',
        };
    }

    const match = filename.match(/favicon-(\d+x\d+)\.png$/);

    return {
        href: url,
        type: 'image/png',
        sizes: match?.[1],
    };
});

export default icons;
