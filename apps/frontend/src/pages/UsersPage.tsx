import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/auth.store';
import { authFetch, parseJsonSafe } from '../lib/authFetch';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'store_admin' | 'cashier' | string;
  isActive: boolean;
  lastLoginAt?: string;
};

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'cashier',
};

export default function UsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await authFetch('/users');
      const data = await parseJsonSafe<any>(res);
      setUsers(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar usuarios');
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (entry: User) => {
    setEditing(entry);
    setForm({
      firstName: entry.firstName,
      lastName: entry.lastName || '',
      email: entry.email,
      password: '',
      role: entry.role,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.email.trim()) {
      toast.error('Nombre y email son requeridos');
      return;
    }

    if (!editing && !form.password.trim()) {
      toast.error('La contrasena es requerida para nuevos usuarios');
      return;
    }

    setLoading(true);
    try {
      const endpoint = editing
        ? `/users/${editing.id}`
        : '/users';

      const payload: Record<string, any> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
      };

      if (form.password.trim()) payload.password = form.password;

      const res = await authFetch(endpoint, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await parseJsonSafe<any>(res);
        const message = Array.isArray(err?.message) ? err.message.join(', ') : err?.message;
        throw new Error(message || 'Error al guardar');
      }

      toast.success(editing ? 'Usuario actualizado' : 'Usuario creado');
      setShowModal(false);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (entry: User) => {
    try {
      const res = await authFetch(`/users/${entry.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !entry.isActive }),
      });

      if (!res.ok) {
        const err = await parseJsonSafe<any>(res);
        const message = Array.isArray(err?.message) ? err.message.join(', ') : err?.message;
        throw new Error(message || 'Error al actualizar');
      }

      toast.success(entry.isActive ? 'Usuario desactivado' : 'Usuario activado');
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar estado');
    }
  };

  const roleLabel = (role: string) => {
    if (role === 'store_admin') return 'Administrador';
    if (role === 'cashier') return 'Cajero';
    return role;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 max-w-6xl mx-auto text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestion de Usuarios</h1>
        <button type="button" onClick={openNew} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg">
          + Nuevo Usuario
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-300 border-b border-gray-700">
              <th className="text-left p-4">Usuario</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Rol</th>
              <th className="text-left p-4">Ultimo acceso</th>
              <th className="text-center p-4">Estado</th>
              <th className="text-center p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-700/70 hover:bg-gray-700/40">
                <td className="p-4">{entry.firstName} {entry.lastName}</td>
                <td className="p-4 text-gray-300">{entry.email}</td>
                <td className="p-4 text-gray-300">{roleLabel(entry.role)}</td>
                <td className="p-4 text-gray-400">
                  {entry.lastLoginAt ? new Date(entry.lastLoginAt).toLocaleString('es-PY') : 'Nunca'}
                </td>
                <td className="p-4 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${entry.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {entry.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button type="button" className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded" onClick={() => openEdit(entry)}>Editar</button>
                    {entry.id !== user?.id && (
                      <button
                        type="button"
                        className={`px-3 py-1 rounded ${entry.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                        onClick={() => handleToggle(entry)}
                      >
                        {entry.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="text-gray-400 text-center py-10">No hay usuarios</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className="bg-gray-700 rounded px-3 py-2" placeholder="Nombre" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
                <input className="bg-gray-700 rounded px-3 py-2" placeholder="Apellido" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
              </div>
              <input className="w-full bg-gray-700 rounded px-3 py-2" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <input className="w-full bg-gray-700 rounded px-3 py-2" type="password" placeholder={editing ? 'Nueva contrasena (opcional)' : 'Contrasena'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              <select className="w-full bg-gray-700 rounded px-3 py-2" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="cashier">Cajero</option>
                <option value="store_admin">Administrador</option>
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="button" className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="button" className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-2 rounded disabled:bg-gray-600" onClick={handleSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

