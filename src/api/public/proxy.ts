import RequestHandler from '@/core/request.handler';

export default class ProxyHandler extends RequestHandler {
    async handle() {
        const url = this.get('url');
        const method = this.get('method') || this.request.method;
        const headers = this.json['headers'] || this.request.headers;

        this.debug(method, url);

        // Filter headers (exclude x-* headers and host)
        const filteredHeaders: Record<string, string> = {};
        
        // Handle both Headers object and plain object
        const headerEntries = headers instanceof Headers 
            ? Array.from(headers.entries())
            : Object.entries(headers);

        for (const [key, value] of headerEntries) {
            const lowerKey = key.toLowerCase();
            if (
                lowerKey.startsWith('x-') || 
                lowerKey === 'host' || 
                lowerKey.includes('upgrade') || 
                lowerKey === 'connection' ||
                lowerKey === 'content-length' // Let fetch calculate this
            ) {
                continue;
            }
            filteredHeaders[key] = String(value);
        }

        // Get request body if present
        let body: string | undefined;
        if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
            // If body is already a string, use it; otherwise stringify
            if (typeof this.request.body === 'string') {
                body = this.request.body;
            } else if (this.request.body) {
                body = JSON.stringify(this.json);
            }
        }

        this.debug('Headers:', filteredHeaders);
        this.debug('Body:', body);

        try {
            // Make the proxied request
            const res = await fetch(url, {
                method,
                headers: filteredHeaders,
                body
            });

            this.debug(res.status, res.statusText);

            // Set response status
            this.res.status(res.status);

            // Copy response headers (exclude problematic ones)
            res.headers.forEach((value, key) => {
                const lowerKey = key.toLowerCase();
                if (
                    lowerKey === 'content-encoding' || 
                    lowerKey === 'transfer-encoding' ||
                    lowerKey === 'connection'
                ) {
                    return;
                }
                this.res.setHeader(key, value);
            });

            // Send response body
            const buffer = await res.arrayBuffer();
            this.res.end(Buffer.from(buffer));

            this.debug(`Response size: ${buffer.byteLength} bytes`);
        } catch (error) {
            this.debug('Proxy error:', error);
            this.res.status(500);
            this.res.json({ 
                error: 'Proxy request failed', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }
}