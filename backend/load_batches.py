#!/usr/bin/env python3
"""
PharmaLedger - Medicine Batch Data Loader
Updated to handle duplicates and deprecation.
"""
import os
import csv
import sys
from datetime import datetime, timezone
from sqlalchemy import create_engine, text
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import sessionmaker

# DB Config (update with your details)
DB_CONFIG = {
    'user': 'root',
    'password': 'Shine2107',  # Change to your MySQL password
    'host': '127.0.0.1:3306',
    'database': 'pharmaledger',
    'port': 3306
}

# Connection string for SQLAlchemy
ENGINE_URL = 'mysql+mysqlconnector://root:Shine2107@127.0.0.1:3306/pharmaledger'
CSV_FILE = 'medicine_batches.csv'  # Assumes in current dir; adjust path if needed

def load_batches_to_db():
    """
    Load CSV data into medicine_batches table.
    """
    if not os.path.exists(CSV_FILE):
        print(f"✗ CSV file '{CSV_FILE}' not found in {os.getcwd()}")
        sys.exit(1)

    print("PharmaLedger - Medicine Batch Data Loader")
    print("=" * 60)
    print(f"Loading data from: {CSV_FILE}")
    print("-" * 60)

    # Create engine and session
    engine = create_engine(ENGINE_URL, echo=False)  # Set echo=True for debug SQL
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Step 1: Truncate table to clear existing data (resets duplicates)
        print("Clearing existing data...")
        with engine.connect() as conn:
            conn.execute(text("TRUNCATE TABLE medicine_batches"))
            conn.commit()
        print("✓ Table truncated successfully.")

        # Step 2: Read CSV and prepare inserts
        batches = []
        with open(CSV_FILE, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row_num, row in enumerate(reader, start=2):  # Start=2 skips header
                if not row or not any(row.values()):  # Skip empty rows
                    continue
                # Map CSV keys to DB columns; set date_uploaded now
                batch_data = {
                    'medicine_id': int(row['medicine_id']) if row.get('medicine_id') else None,
                    'batch_number': row['batch_number'].strip().upper(),
                    'medicine_name': row['medicine_name'].strip(),
                    'manufacture_date': row['manufacture_date'],  # Assumes YYYY-MM-DD string; SQLAlchemy parses
                    'expiry_date': row['expiry_date'],
                    'pharmacy_name': row['pharmacy_name'].strip() if row.get('pharmacy_name') else None,
                    'date_uploaded': datetime.now(timezone.utc)  # Fixed: Use timezone-aware UTC
                }
                batches.append(batch_data)
                if len(batches) % 5 == 0:
                    print(f"Read {len(batches)} rows...")

        if not batches:
            print("✗ No valid data found in CSV.")
            return

        print(f"Inserting {len(batches)} batches...")

        # Step 3: Batch insert with SQLAlchemy text query
        insert_sql = text("""
            INSERT INTO medicine_batches 
            (medicine_id, batch_number, medicine_name, manufacture_date, expiry_date, pharmacy_name, date_uploaded) 
            VALUES (:medicine_id, :batch_number, :medicine_name, :manufacture_date, :expiry_date, :pharmacy_name, :date_uploaded)
        """)

        with engine.connect() as conn:
            conn.execute(insert_sql, batches)  # executemany via list of dicts
            conn.commit()

        print("✓ Data loaded successfully!")
        print(f"Total batches inserted: {len(batches)}")

        # Optional: Verify a sample query
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM medicine_batches")).scalar()
            print(f"DB verification: {result} rows in table.")

    except IntegrityError as e:
        session.rollback()
        print(f"✗ Integrity Error (e.g., duplicates): {e}")
        print("Tip: Ensure medicine_id in CSV is unique or let DB auto-increment.")
    except SQLAlchemyError as e:
        session.rollback()
        print(f"✗ Database Error: {e}")
    except FileNotFoundError:
        print(f"✗ CSV file not found: {CSV_FILE}")
    except Exception as e:
        session.rollback()
        print(f"✗ Unexpected Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()
        engine.dispose()

if __name__ == '__main__':
    load_batches_to_db()
