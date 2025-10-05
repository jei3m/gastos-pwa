import { 
    CreateCategory,
    EditCategory
} from "@/types/categories.types";

export const fetchCategories = async() => {
    try {
        const res = await fetch('http://localhost:3000/api/categories');
        const data = await res.json();
        return(data.data);
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message)
        };
        throw Error('Failed to Fetch Categories');
    }
};

export const createCategory = async(category: CreateCategory) => {
    try {
        const res = await fetch('http://localhost:3000/api/categories', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(category)
        });
        const data = await res.json();
        if(!res.ok) throw Error(data.message);
        return(data.data);
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message);
        };
        throw Error('Failed to Create Category');
    };
};

export const editCategory = async(uuid:string, category: EditCategory) => {
    try {
        const res = await fetch(`http://localhost:3000/api/categories/${uuid}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(category)
        });
        const data = await res.json();
        if(!res.ok) throw Error(data.message);
        return(data.data);
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message);
        };
        throw Error('Failed to Edit Category');
    };
};

export const deleteCategory = async(uuid:string) => {
    try {
        const res = await fetch(`http://localhost:3000/api/categories/${uuid}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
        });
        const data = await res.json();
        if(!res.ok) throw Error(data.message);
        return(data.data);
    } catch (error) {
        if (error instanceof Error) {
            throw Error(error.message);
        };
        throw Error('Failed to Delete Category');
    };
};