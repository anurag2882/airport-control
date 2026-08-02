# Schema inference notes

The 8 provided CSVs shipped with numeric headers (`0,1,2,...`) instead of column names, and
`data_dictionary.md` only describes tables at a high level, not individual columns. Names below
were assigned by profiling value patterns (dtype, cardinality, sample values) across the full files.

**High confidence** (unambiguous from values): flight_number, airline_name, airline_code,
origin/destination_airport, scheduled/actual departure & arrival, aircraft_type,
aircraft_registration, terminal, gate, delay_reason, pnr_code, passport_number, first/last_name,
nationality, date_of_birth, gender, seat_number, fare_class, bag_tag_number, weight_kg,
work_order_id, defect_type, staff_id, staff_name, department, role, shift_date/start/end,
transaction_id, product_category, payment_method, currency.

**Medium confidence** (plausible given position + type, not 100% certain): seat_capacity vs.
passengers_booked (two close integers per flight — assumed capacity is the larger, booked the
smaller), delay_risk_score (a 0–1 float, likely an ML-style feature given the data dictionary's
"Flight delay prediction" use case), on_time_performance_score, turnaround_time_minutes,
scan_count on baggage, queue_length/queue_capacity/wait_estimate_seconds on security,
amount_inr vs amount_alt on retail (two similar but distinct currency-looking values per row).

**A few columns are constant across the entire file** (e.g. every flight shows status
"Departed", every retail row is "Duty Free"/"Card"/"INR", gate_events are all "B12"/"T3"/"Boarding
Start"). These aren't filterable in the current build since there's no variance to filter on —
worth flagging to judges as a data characteristic rather than a bug if asked.

Fully-empty columns (all-null across every row) were dropped rather than guessed at.

If you get the real data dictionary with exact column names before submission, swapping the
`schemas` mapping in the header-injection step (already applied to `public/data/*.csv`) is a
5-minute fix — just re-run the same rename against the original headerless files.

## Known data quirk: staff_shifts.csv has 7 constant columns

`terminal`, `gate_assigned`, `department`, `role`, `shift_duration_hours`, `is_on_leave`, and
`language` are the same value across every one of the 600 rows (`T3`, `B12`, `Ops`, `Agent`, `8`,
`False`, `English` respectively). None of these carry real information, so:

- The Staff page no longer shows Department/Role/Gate/On-Leave columns from the raw CSV.
- The flight drill-down no longer claims to show gate-specific crew — there's no field that
  actually ties a staff member to a specific gate or flight, so it instead shows same-day
  airport-wide staffing, broken down by department.
- The Dashboard's staffing KPI is "staff on duty today" (via `shift_date`, which does vary),
  not "staff on leave" (which was always reading a constantly-`False` column and always showed 0).

**The real department signal** is hidden in the `staff_id` prefix instead of the `department`
column: `SEC-` = Security, `CC-` = Customer Care, `RET-` = Retail, `GH-` = Ground Handling,
`MTC-` = Maintenance, `OPS-` = Operations — fairly evenly split across the 600 staff. This is
derived in `src/lib/staffDepartment.ts` and attached to every staff record as
`derived_department` at load time; the original `department` field is kept on the type for
transparency but isn't used anywhere in the UI.

Columns that do genuinely vary and are safe to use: `staff_id`, `staff_name`, `shift_date`,
`shift_start`, `shift_end`, `supervisor_id`, `last_shift_date`.

## Known data quirk: maintenance_logs join key

`maintenance_logs.csv` has an `aircraft_registration` column, but every row shares the same
value (`VT-ABC`), which never matches any real tail number in `flights.csv`. It also has its
own `flight_number` column with 330 unique values that all match real flights — that's the
correct join key, and it's what `FlightDrilldown.tsx` uses. If you regenerate or swap the
maintenance dataset later, re-check which column actually varies before joining.
