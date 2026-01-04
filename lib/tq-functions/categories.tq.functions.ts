import {
	CategoryData,
	CreateCategory,
	EditCategory
} from "@/types/categories.types";

export const fetchCategories = async (
  filter: string | null,
  accountID: string | null,
  dateStart?: string,
  dateEnd?: string
) => {
  try {
    // Create URLSearchParams object
    const params = new URLSearchParams();
    
    if (filter) params.append('filter', filter);
    if (accountID) params.append('accountID', accountID);
    if (dateStart) params.append('dateStart', dateStart);
    if (dateEnd) params.append('dateEnd', dateEnd);
    
    const res = await fetch(`/api/categories?${params.toString() || ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.message);
    };

		const sortedData = JSON.parse(JSON.stringify(data.data));
		// Sort category details by name
		sortedData.forEach((category: CategoryData) => {
			category.details.sort((a, b) => {
				return a.name.localeCompare(b.name);
			})
		});

    return sortedData;
  } catch (error) {
    if (error instanceof Error) {
      throw error; // Just re-throw the existing error
    }
    throw new Error('Failed to Fetch Categories');
  }
};

export const fetchCategoryByID = async (id: string) => {
	try {
		const res = await fetch(`/api/categories/${id}`, {
			method: 'GET',
		});
		const data = await res.json();
    if (!data.success) {
      throw Error(data.message)
    };
		return (data.data[0] || null)
	} catch (error) {
		if (error instanceof Error) {
			throw Error(error.message)
		};
		throw Error('Failed to Fetch Category');
	}
};

export const createCategory = async (category: CreateCategory) => {
	try {
		const res = await fetch('/api/categories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(category)
		});
		const data = await res.json();
    if (!data.success) {
      throw Error(data.message)
    };
		return (data.data);
	} catch (error) {
		if (error instanceof Error) {
			throw Error(error.message);
		};
		throw Error('Failed to Create Category');
	};
};

export const editCategory = async (id: string, category: EditCategory) => {
	try {
		const res = await fetch(`/api/categories/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(category)
		});
		const data = await res.json();
    if (!data.success) {
      throw Error(data.message)
    };
		return (data.data);
	} catch (error) {
		if (error instanceof Error) {
			throw Error(error.message);
		};
		throw Error('Failed to Edit Category');
	};
};

export const deleteCategory = async (id: string) => {
	try {
		const res = await fetch(`/api/categories/${id}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
		});
		const data = await res.json();
    if (!data.success) {
      throw Error(data.message)
    };
		return (data.data);
	} catch (error) {
		if (error instanceof Error) {
			throw Error(error.message);
		};
		throw Error('Failed to Delete Category');
	};
};