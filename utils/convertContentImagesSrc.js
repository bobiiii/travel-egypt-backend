 const convertContentImagesSrc = (content) => {
    if (!content) return content;
    return content.replace(/<img\s+([^>]*name=['"]([^'"]+)['"][^>]*)>/g, (match, attributes, name) => {
        const cleanedID = name.replace(/^\/|\/$/g, '').replace(/^\\|\\$/g, ''); // Removes both `/` and `\`
        return match.replace(/src=['"]([^'"]*)['"]/, `src='https://drive.google.com/thumbnail?id=${cleanedID}&sz=w1000'`);
    });
};


module.exports = { convertContentImagesSrc };