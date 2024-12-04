import axios from "axios"
import { useState } from 'react';
import { API_URL } from "../constants";
import HeadersMapper from "./HeadersMapper";


export default function CallbackForm() {
    const [requestInProgress, setRequestInProgress] = useState(false);
    const [spreadSheetId, setSpreadSheetId] = useState('');
    const [sheetDoesNotExist, setSheetDoesNotExist] = useState(false);
    const [spreadSheet, setSpreadSheet] = useState(null);
    const [selectedSheet, setSelectedSheet] = useState('');
    const [range, setRange] = useState('');
    const [headers, setHeaders] = useState([]);
    const [headersMap, setHeadersMap] = useState(null);
    const [configSaved, setConfigSaved] = useState(false);


    let queryParams = new URLSearchParams(window.location.search);
    if (!queryParams.has('code')) {
        return <p>Vous n&apos;avez pas autorisé cette application</p>
    }

    if (configSaved) {
        return <p>Votre compte est configuré. Vos informations seront synchronisés désormais.</p>
    }


    return <form>
        <div className="mb-3">
            <label htmlFor="document-id" className="form-label">Entrez le code de votre document :</label>
            <input type="text" className="form-control" id="document-id" value={spreadSheetId} onChange={(e) => setSpreadSheetId(e.target.value)}></input>
        </div>
        {sheetDoesNotExist && <div className="mb-3"><span className="text-danger">Ce code est invalide</span></div>}
        {(spreadSheetId && spreadSheet == null) && (requestInProgress ? <div className="spinner-border text-primary">
            <span className="sr-only"></span>
        </div> : <button type="button" className="btn btn-primary w-100 mb-3" onClick={
            async () => {
                let { data, status } = await fetchSheet(spreadSheetId, setRequestInProgress);
                if (status == 404) setSheetDoesNotExist(true);
                if (status == 200) setSpreadSheet(data);

            }}>Valider</button>)}
        {spreadSheet != null && <select name="sheet" id="sheet-select" className="form-select mb-3" onChange={(e) => setSelectedSheet(e.target.value)}>
            {spreadSheet?.sheets.map((sheet) => {
                return <option key={sheet.properties.sheetId} value={sheet.properties.title}>{sheet.properties.title}</option>
            })}
        </select>}
        {selectedSheet != '' && <input type="text" className="form-control mb-3" placeholder="Entrez la plage de vos données (ex: A:H)" value={range} onChange={(e) => setRange(e.target.value)}></input>}
        {spreadSheetId && spreadSheet != null && selectedSheet && range && headers.length == 0 && (requestInProgress ? <div className="spinner-border text-primary">
            <span className="sr-only"></span>
        </div> : <button type="button" className="btn btn-primary w-100 mb-3" onClick={
            async () => {
                let { data, status } = await fetchSheetHeaders(spreadSheetId, selectedSheet, range, setRequestInProgress);
                if (status == 200) {
                    setHeaders(data);
                }
            }}>Valider</button>)}
        {headers.length > 0 && <fieldset><legend>Association</legend><HeadersMapper fields={headers} onSave={(mapping) => { setHeadersMap(mapping) }} /></fieldset>}
        {headersMap != null && <button type="button" className="btn btn-primary" onClick={
            async () => {
                let { status } = await save({ account: queryParams.get('code'), tab_name: selectedSheet, code: spreadSheet.spreadsheetId, range: range, headers: headersMap, headers_list: headers });
                if (status == 201) {
                    setConfigSaved(true);
                }
            }
        }>Enregister ma configuration</button>}
    </form>
}


async function fetchSheet(code, setRequestInProgress) {
    setRequestInProgress(true)
    let response = await axios({ method: "GET", url: `${API_URL}/spreadsheets/${code}` });
    setRequestInProgress(false)
    return { data: response.data, status: response.status }
}

async function fetchSheetHeaders(code, sheet, range, setRequestInProgress) {
    setRequestInProgress(true)
    let response = await axios.get(`${API_URL}/spreadsheets/${code}/headers`, { params: { sheet, range } });
    setRequestInProgress(false)
    return { data: response.data, status: response.status }
}

async function save(config) {
    let response = await axios.post(`${API_URL}/sheets`, config);
    return { data: response.data, status: response.status }
}