import React, { useEffect, useState } from 'react';
import API from '../api';

export default function SeatMap({ eventId, sectionId, onHold }) {
const [seats, setSeats] = useState([]);
const load = async () => {
const res = await API.get(`/seats/${eventId}/section/${sectionId}`);
setSeats(res.data);
};
useEffect(() => { load(); }, [eventId, sectionId]);
const hold = async (seatId) => {
try {
const res = await API.post('/bookings/hold', { eventId, seatId, userId:
1, seconds: 600 });
alert(`Seat held! Expires: ${res.data.expires_at}`);
onHold && onHold(res.data.hold_id);
load();
} catch (e) {
alert(e.response?.data?.error || e.message);
load();
}
};
return (
<div>
<h3>Seats</h3>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)',
gap: 8 }}>

{seats.map(s => (
<button key={s.seat_id} onClick={() => hold(s.seat_id)} disabled={s.status !== 'AVAILABLE'} style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', opacity: s.status==='AVAILABLE'?1:0.6 }}>
{s.row_label}{s.seat_number}<br/>
<small>{s.status}</small><br/>
<small>{s.price ? `₹${s.price}` : '-'}</small>
</button>
))}
</div>
</div>
);
}
