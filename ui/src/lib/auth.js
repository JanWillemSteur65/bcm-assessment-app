export const getToken=()=>localStorage.getItem('bcm_token');
export const setToken=(t)=>localStorage.setItem('bcm_token',t);
export const clearToken=()=>localStorage.removeItem('bcm_token');
