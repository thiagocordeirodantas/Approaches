import { handleStatus } from '../utils/promise-helpers.js';
import { partialize, pipe } from '../utils/operators.js';
// importou Maybe
import { Maybe } from '../utils/maybe.js';

const API = 'http://localhost:3000/notas';

// adequou cada função para receber o tipo monádico

const getItemsFromNotas = notasM => notasM.map(notas => notas.$flatMap(nota => nota.itens));

const filterItemsByCode = (code, itemsM) => itemsM.map(items => items.filter(item => item.codigo == code));

const sumItemsValue = itemsM => itemsM.map(items => items.reduce((total, item) => total + item.valor, 0));

export const notasService = {

    listAll() {

        return fetch(API)
            .then(handleStatus)
            // retorna um `Maybe`
            .then(notas => Maybe.of(null))
            .catch(err => {
                console.log(err);
                return Promise.reject('Não foi possível obter as notas fiscais');
            });
    },

    sumItems(code) {
        const filterItems = partialize(filterItemsByCode, code);

        const sumItems = pipe(
            getItemsFromNotas, 
            filterItems, 
            sumItemsValue
        );

        return this.listAll()
            .then(sumItems)
            // obtendo o valor da mônada 
            .then(result => result.getOrElse(0));
    }
};