import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigation, Link } from '@remix-run/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import User, { deleteUserWithInvoices, IUser } from '~/models/user.server';
import { getUserFromRequest } from '~/utils/auth.server';
import { connectToDatabase } from '~/utils/db.server';
import SkeletonRow from '~/utils/skeleton';


export async function loader({ request }: LoaderFunctionArgs) {
    const authUser = getUserFromRequest(request);
    if (!authUser || authUser.role !== 'admin') {
        return redirect('/');
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 10;
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    await connectToDatabase();

    const query: any = {};


    function escapeRegExp(str: string) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    if (search) {
        const escapedSearch = escapeRegExp(search);
        query.$or = [
            { username: { $regex: escapedSearch, $options: 'i' } },
            { email: { $regex: escapedSearch, $options: 'i' } },
            { firstName: { $regex: escapedSearch, $options: 'i' } },
            { lastName: { $regex: escapedSearch, $options: 'i' } }
        ];
    }


    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [users, totalUsers] = await Promise.all([
        User.find(query)
            .select('-password')
            .sort(sortObj)
            .limit(limit)
            .skip((page - 1) * limit),
        User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return json({
        users,
        pagination: {
            currentPage: page,
            totalPages,
            totalUsers,
            hasNext: page < totalPages,
            hasPrev: page > 1
        },
        filters: { search },
        sorting: { sortBy, sortOrder },
        authUserId: authUser.userId
    });
}

export async function action({ request }: ActionFunctionArgs) {

    const formData = await request.formData();
    const action = formData.get('_action') as string;
    const userId = formData.get('userId') as string;

    await connectToDatabase();

    if (action === 'toggleStatus') {
        try {
            const user = await User.findById(userId);

            user.isActive = !user.isActive;
            await user.save();

            return json({
                success: true,
                message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
            });
        } catch (error) {
            return json({ error: 'Failed to update user status' }, { status: 500 });
        }
    }


    if (action === 'changeRole') {
        const newRole = formData.get('role') as 'user' | 'admin';

        try {
            const user = await User.findById(userId);

            user.role = newRole;
            await user.save();

            return json({
                success: true,
                message: `User role changed to ${newRole} successfully`
            });
        } catch (error) {
            return json({ error: 'Failed to change user role' }, { status: 500 });
        }
    }

    if (action === 'deleteUser') {
        try {

            const result = await deleteUserWithInvoices(userId);
            return json({
                success: true,
                message: `User deleted successfully. ${result.deletedInvoicesCount} invoices were also deleted.`
            });
        } catch (error) {
            return json({ error: 'Failed to delete user' }, { status: 500 });
        }
    }

    return json({ error: 'Invalid action' }, { status: 400 });
}


export default function AdminUsers() {
    const { users, pagination, filters, sorting, authUserId } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const [jumpPage, setJumpPage] = useState('');

    const isLoading = navigation.state === "loading";

    const getSortIcon = (column: string) => {
        if (sorting.sortBy !== column) {
            return (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        return sorting.sortOrder === 'asc' ? (
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    const getSortUrl = (column: string) => {
        const newSortOrder = sorting.sortOrder === 'asc' ? 'desc' : 'asc';
        const params = new URLSearchParams();
        params.set('sortBy', column);
        params.set('sortOrder', newSortOrder);
        if (filters.search) params.set('search', filters.search);
        return `?${params.toString()}`;
    };

    


    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <Form method="get" className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 items-end">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            id="search"
                            name="search"
                            defaultValue={filters.search}
                            placeholder="Search by name, username, or email"
                            className="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </Form>
            </div>


            {actionData && 'error' in actionData && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">{actionData.error}</div>
                </div>
            )}

            {actionData && 'success' in actionData && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="text-green-800">{actionData.message}</div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">
                        Total Users: {pagination.totalUsers}
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <Link
                                        to={getSortUrl('username')}
                                        className="flex items-center space-x-1 hover:text-gray-700"
                                    >
                                        <span>Username</span>
                                        {getSortIcon('username')}
                                    </Link>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <Link
                                        to={getSortUrl('email')}
                                        className="flex items-center space-x-1 hover:text-gray-700"
                                    >
                                        <span>Email</span>
                                        {getSortIcon('email')}
                                    </Link>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <Link
                                        to={getSortUrl('role')}
                                        className="flex items-center space-x-1 hover:text-gray-700"
                                    >
                                        <span>Role</span>
                                        {getSortIcon('role')}
                                    </Link>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <Link
                                        to={getSortUrl('isActive')}
                                        className="flex items-center space-x-1 hover:text-gray-700"
                                    >
                                        <span>Status</span>
                                        {getSortIcon('isActive')}
                                    </Link>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <Link
                                        to={getSortUrl('createdAt')}
                                        className="flex items-center space-x-1 hover:text-gray-700"
                                    >
                                        <span>Joined</span>
                                        {getSortIcon('createdAt')}
                                    </Link>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <Link
                                        to={getSortUrl('lastLogin')}
                                        className="flex items-center space-x-1 hover:text-gray-700"
                                    >
                                        <span>Last Login</span>
                                        {getSortIcon('lastLogin')}
                                    </Link>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading
                                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} columns={7}/>)
                                : users.map((user: IUser) => (
                                    <tr key={user._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.username}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{user.firstName} {user.lastName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="inline text-sm font-medium text-gray-900">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Form method="post" >
                                                <input type="hidden" name="_action" value="changeRole" />
                                                <input type="hidden" name="userId" value={user._id} />

                                                {user._id === authUserId ? (
                                                    <span className="inline-flex justify-right text-sm font-medium text-gray-900">
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <select
                                                        name="role"
                                                        defaultValue={user.role}
                                                        onChange={(e) => e.target.closest('form')?.requestSubmit()}
                                                        className="inline-flex justify-center text-sm font-medium text-gray-900"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                )}
                                            </Form>
                                        </td>



                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Form method="post" className="inline">
                                                <input type="hidden" name="_action" value="toggleStatus" />
                                                <input type="hidden" name="userId" value={user._id} />
                                                {user._id === authUserId ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Activate
                                                    </span>
                                                ) : (
                                                    <select
                                                        name="Active"
                                                        defaultValue={user.isActive ? 'active' : 'inactive'}
                                                        onChange={(e) => e.target.closest('form')?.requestSubmit()}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        <option value="active">Activate</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                )}
                                            </Form>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt!).toLocaleDateString("en-GB")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.lastLogin
                                                ? new Date(user.lastLogin).toLocaleDateString("en-GB")
                                                : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 justify-center whitespace-nowrap text-right text-sm font-medium space-x-2">

                                            <Form
                                                method="post"
                                                className="inline"
                                                onSubmit={(e) => {
                                                    if (!confirm('Are you sure you want to delete this user? Their invoices will also be deleted')) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <input type="hidden" name="_action" value="deleteUser" />
                                                <input type="hidden" name="userId" value={user._id} />

                                                {user._id === authUserId ? (
                                                    <span></span>
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        className="text-red-600 hover:text-red-900 w-8 h-8"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </Form>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                            <div className="flex items-center gap-4 text-sm text-gray-700">
                                <span>
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>

                                <div className="flex items-center gap-2">
                                    <span>Select Page:</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={pagination.totalPages}
                                        value={jumpPage}
                                        onChange={(e) => {
                                            let value = parseInt(e.target.value);
                                            if (isNaN(value)) value = 1;
                                            if (value < 1) value = 1;
                                            if (value > pagination.totalPages) value = pagination.totalPages;
                                            setJumpPage(value.toString());
                                        }}
                                        className="w-20 px-2 py-1 border rounded text-sm"
                                    />
                                    <Link
                                        to={`?page=${jumpPage || 1}&search=${filters.search}&sortBy=${sorting.sortBy}&sortOrder=${sorting.sortOrder}`}
                                        className="px-3 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
                                    >
                                        Go
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {pagination.hasPrev && (
                                    <Link
                                        to={`?page=${pagination.currentPage - 1}&search=${filters.search}&sortBy=${sorting.sortBy}&sortOrder=${sorting.sortOrder}`}
                                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {pagination.hasNext && (
                                    <Link
                                        to={`?page=${pagination.currentPage + 1}&search=${filters.search}&sortBy=${sorting.sortBy}&sortOrder=${sorting.sortOrder}`}
                                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}