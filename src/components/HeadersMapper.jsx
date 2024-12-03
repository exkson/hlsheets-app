import PropTypes from 'prop-types';
import { useState } from 'react';

export default function HeadersMapper({ fields, onSave }) {
    const [mapping, setMapping] = useState({});
    const [selectedField, setSelectedField] = useState('');
    const [selectedMapping, setSelectedMapping] = useState('');
    const [hideSelects, setHideSelects] = useState(false);

    const supportedKeys = {
        "first_name": "Prénom",
        "last_name": "Nom de famille",
        "full_name": "Nom complet",
        "notes": "Notes",
        "email": "Email",
        "phone": "Téléphone",
        "city": "Ville"
    }


    return <div className='mb-3'>
        {!hideSelects && <div>
            <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)} className='form-select mb-3'>
                <option value="" disabled>Selectionnez une colonne</option>
                {fields.map((field, i) => <option key={`field-${i}`} value={field}>{field}</option>)}
            </select>
            <select value={selectedMapping} onChange={(e) => setSelectedMapping(e.target.value)} className='form-select mb-3'>
                <option value="" disabled>Selectionnez un champ</option>
                {Object.entries(supportedKeys).map(entry => <option key={entry[0]} value={entry[0]}>{entry[1]}</option>)}
            </select>
            <div className="flex row g-3">
                <button type='button' className='btn btn-success col-6' onClick={
                    () => { onSave(mapping); setHideSelects(true) }
                }>Terminer</button>
                <button type='button' className='btn btn-primary col-6' onClick={
                    () => {
                        let selection = {};
                        selection[selectedField] = selectedMapping;
                        setMapping({ ...mapping, ...selection })
                    }
                }>Enregistrer la paire</button>
            </div>
        </div>}
        <div>
            <ul>
                {Object.entries(mapping).filter(((v) => v[1] != "")).map(([key, value]) => {
                    return <li key={key}>{key} » {supportedKeys[value]}</li>
                })}
            </ul>
        </div>
    </div >
}

HeadersMapper.propTypes = {
    fields: PropTypes.arrayOf(PropTypes.string),
    onSave: PropTypes.func
}