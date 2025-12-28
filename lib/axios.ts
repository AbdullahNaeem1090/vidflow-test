import axios from "axios";

export const myAxios = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});


myAxios.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
  
    const resp=error.response
    
    if (resp && resp.status === 401) {

      console.log("returning");
      
      const currentPath = window.location.pathname;
  
      const isProtected = ["/login", "/sign-up", "/forgot-password"].includes(currentPath);

      if (!isProtected) {
        
        window.location.href = "/login";
        
      }
    }

    return Promise.reject(error);
  });