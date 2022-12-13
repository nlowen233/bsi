const flipSlashes = (s:string) =>{
    return replaceAll(s,'/','\\')
}

const replaceAll = (str:string, find:string, replace:string) => {
    return str.replace(new RegExp(find, 'g'), replace);
}

export const StringUtils = {
    flipSlashes
}