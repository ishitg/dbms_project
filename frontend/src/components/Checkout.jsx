import React from 'react';
import API from '../api';
export default function Checkout({ holdId }) {
const confirm = async () => {

try {
const res = await API.post('/bookings/confirm', { holdId, userId: 1,
price: 500 });
alert('Booking Confirmed: ' + res.data.bookingId);
} catch (e) {
alert(e.response?.data?.error || e.message);
}};

return (
<div style={{ marginTop: 20 }}>
<button disabled={!holdId} onClick={confirm} style={{ padding: 12,
borderRadius: 8 }} className='cursor-pointer'>
Confirm Booking
</button>
</div>
);
}
