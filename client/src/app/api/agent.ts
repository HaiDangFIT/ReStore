import axios, { AxiosResponse, AxiosError } from "axios";
import { toast } from "react-toastify";

const sleep = () => new Promise(resolve => setTimeout(resolve, 500));

axios.defaults.baseURL = 'http://localhost:5000/api/';

const responseBody = (response: AxiosResponse) => response.data;

axios.interceptors.response.use(async response => {
    await sleep()
    return response
}, (error: AxiosError) => {
    const {data, status} = error.response as AxiosResponse;

    switch (status) {
        case 400:
            if (data.errors) {
                const modelStateErrors: string [] = [];
                for (const key in data.errors) {
                    if (data.errors[key]) {
                        modelStateErrors.push(data.errors[key])
                    }
                }
                throw modelStateErrors.flat();
            }
            toast.error(data.title);
            break;
        case 401:
            toast.error(data.title);
            break;
        case 500:
            
            toast.error(data.title);
            break;
        default:
            break;
    }
    return Promise.reject(error.response);
})

const requsets = {
    get: (url: string) => axios.get(url).then(responseBody),
    post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
    put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
    delete: (url: string) => axios.delete(url).then(responseBody),
}

const Catalog = {
    list: () => requsets.get('products'),
    details: (id: number) => requsets.get(`products/${id}`)
}

const TestErrors = {
    get400Error: () => requsets.get('buggy/bad-request'),
    get401Error: () => requsets.get('buggy/unauthorised'),
    get404Error: () => requsets.get('buggy/not-found'),
    get500Error: () => requsets.get('buggy/server-error'),
    getValidationError: () => requsets.get('buggy/validation-error'),

}

const agent = {
    Catalog,
    TestErrors
}

export default agent;