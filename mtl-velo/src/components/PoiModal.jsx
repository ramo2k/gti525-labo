import React, { useState, useEffect } from 'react';

const PoiModal = ({ isOpen, onClose, onSave, poiToEdit = null }) => {
    // Liste des types possibles d'après les données csv de la phase 1
    const typesPossibles = ["Atelier", "Fontaine", "Vélo blanc", "Magasin", "Autre"];
    const arrondissementsPossibles = [
        "Ahuntsic-Cartierville", "Anjou", "Côte-des-Neiges-Notre-Dame-de-Grâce",
        "Lachine", "LaSalle", "Le Plateau-Mont-Royal", "Le Sud-Ouest",
        "L'Île-Bizard-Sainte-Geneviève", "Mercier-Hochelaga-Maisonneuve",
        "Montréal-Nord", "Outremont", "Pierrefonds-Roxboro",
        "Rivière-des-Prairies-Pointe-aux-Trembles", "Rosemont-La Petite-Patrie",
        "Saint-Laurent", "Saint-Léonard", "Verdun", "Ville-Marie", "Villeray-Saint-Michel-Parc-Extension"
    ];

    const [formData, setFormData] = useState({
        Arrondissement: '',
        Nom: '',
        Type: 'Atelier',
        Intersection: '',
        Latitude: '',
        Longitude: ''
    });

    useEffect(() => {
        if (poiToEdit) {
            setFormData({
                Arrondissement: poiToEdit.Arrondissement || '',
                Nom: poiToEdit.Nom || '',
                Type: poiToEdit.Type || 'Atelier',
                Intersection: poiToEdit.Intersection || '',
                Latitude: poiToEdit.Latitude || '',
                Longitude: poiToEdit.Longitude || ''
            });
        } else {
            // Valeurs par défaut pour une création
            setFormData({
                Arrondissement: '',
                Nom: '',
                Type: 'Atelier',
                Intersection: '',
                Latitude: '',
                Longitude: ''
            });
        }
    }, [poiToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-mtl-primaire">
                        {poiToEdit ? 'Modifier le Point d\'Intérêt' : 'Ajouter un Point d\'Intérêt'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-black">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 overflow-y-auto">
                    <form id="poiForm" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-mtl-texte mb-1">Nom du lieu *</label>
                            <input
                                type="text"
                                name="Nom"
                                required
                                value={formData.Nom}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-mtl-primaire"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-mtl-texte mb-1">Arrondissement *</label>
                            <select
                                name="Arrondissement"
                                required
                                value={formData.Arrondissement}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-mtl-primaire"
                            >
                                <option value="">Sélectionner...</option>
                                {arrondissementsPossibles.map(arr => (
                                    <option key={arr} value={arr}>{arr}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-mtl-texte mb-1">Type *</label>
                            <select
                                name="Type"
                                required
                                value={formData.Type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:border-mtl-primaire"
                            >
                                {typesPossibles.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {/* Champs adaptatifs selon le type */}
                        {formData.Type === 'Fontaine' && (
                            <div className="bg-blue-50 p-3 rounded border border-blue-100">
                                <p className="text-sm text-blue-800 mb-2 font-medium">ℹ️ Champs spécifiques (Fontaine)</p>
                                <label className="block text-sm text-mtl-texte mb-1">Intersection / Emplacement exact</label>
                                <input
                                    type="text"
                                    name="Intersection"
                                    value={formData.Intersection}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-mtl-primaire"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-mtl-texte mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="Latitude"
                                    value={formData.Latitude}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-mtl-primaire"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-mtl-texte mb-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="Longitude"
                                    value={formData.Longitude}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-mtl-primaire"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t bg-slate-50 flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded hover:bg-slate-100 text-slate-700"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        form="poiForm"
                        className="px-4 py-2 rounded bg-mtl-primaire hover:bg-mtl-survol text-white font-medium"
                    >
                        {poiToEdit ? 'Mettre à jour' : 'Créer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PoiModal;
