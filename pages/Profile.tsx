
import React from 'react';
import { useAuth } from '../App';

const Profile = () => {
    const { username, logout } = useAuth();

    return (
        <div className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#C5FF00] rounded-full mix-blend-lighten filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-lighten filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
            
            <h1 className="text-3xl font-bold mb-6">Perfil</h1>
            
            <div className="relative z-10 max-w-2xl mx-auto bg-[#111111]/50 backdrop-blur-sm border border-gray-800 rounded-lg p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
                    {username?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold">{username}</h2>
                <p className="text-gray-400">seu@email.com</p>

                <div className="my-6 p-4 bg-gray-800/50 rounded-lg">
                    <p className="text-lg">Plano Atual: <span className="font-bold text-[#C5FF00]">Premium</span></p>
                    <button className="mt-2 text-sm text-[#C5FF00] hover:underline">Gerenciar Assinatura</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">Editar Perfil</button>
                    <button className="w-full p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition">Trocar Senha</button>
                </div>

                <button 
                    onClick={logout}
                    className="w-full mt-6 py-3 bg-red-600/50 border border-red-500 rounded-lg hover:bg-red-600 transition font-bold"
                >
                    Sair da Conta
                </button>
            </div>
        </div>
    );
};

export default Profile;
