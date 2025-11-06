
export const getQueryParam = (key, query) => {
    const queryParams = new URLSearchParams(query);
    return queryParams.has(key) ? queryParams.get(key) === 'true' : false;
};