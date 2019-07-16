import axios from 'axios';

const baseURL = `https://app.gitkraken.com/api/glo/v2`
const board_id = '5d27a1c198d023000f8cf0e5';

const glo = axios.create({
    baseURL,
});

export default async function getGloData () {
    const { name, columns } = (await glo.get(`/boards/${board_id}?fields=columns%2Cname`)
        .catch(error => console.error(error))
        ).data;
        
    const p = [];
    for (const column of columns){
        p.push(getCards(column.id))
    }
    const all_cards = await Promise.all(p);
    for (let i = 0; i < all_cards.length; i++){
        columns[i].cards = all_cards[i]
    }
    return {
        name,
        columns
    };
}

const getCards = async (column) => {
    let column_id = column;
    if (typeof column != 'string') {
        column_id = column.id;
    }
    let has_more = true;
    let cards = []
    while (has_more) {
        const response = await glo.get(`/boards/${board_id}/columns/${column_id}/cards?fields=board_id%2Carchived_date%2Cboard_id%2Cdue_date%2Cname%2Ccover_image_attachment_id%2Ccolumn_id%2Ccreated_by%2Ccreated_date%2Cmembers%2Clabels%2Cattachment_count%2Ccomment_count%2Ctotal_task_count%2Ccompleted_task_count%2Cdescription%2Cstatus%2Csync_provider_id%2Cupdated_date&sort=archived_date&page=1&per_page=100`)
            .catch(error => console.error(error));
        has_more = response.headers['has_more'];
        cards = cards.concat(response.data);
    }
    return cards;
}
