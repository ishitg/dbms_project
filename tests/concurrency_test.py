import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

API = 'http://localhost:4000/api/bookings/hold'
EVENT_ID, SEAT_ID = 1, 8

def try_hold(i):
    payload = {'eventId': EVENT_ID, 'seatId': SEAT_ID, 'userId': 1000 + i}
    r = requests.post(API, json=payload)
    return r.status_code

if __name__ == '__main__':
    ok = fail = 0
    with ThreadPoolExecutor(max_workers=20) as ex:
        futures = [ex.submit(try_hold, i) for i in range(20)]
        for f in as_completed(futures):
            if f.result() == 200:
                ok += 1
            else:
                fail += 1
    print('Success:', ok, 'Failures:', fail)
