import http from 'http';

http.get('http://localhost/sabir/mu/wp-json/wp/v2/pages?slug=contact-us-ml&acf_format=standard', res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed[0].acf, null, 2));
        } catch (e) {
            console.error('Error parsing JSON:', e);
            console.log(data);
        }
    });
}).on('error', err => {
    console.error('Request Error: ', err.message);
});
