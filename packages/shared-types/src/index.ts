export const SHARED_CONSTANTS = {
    AppName: 'School ERP'
};

// Placeholder for shared interfaces
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}
