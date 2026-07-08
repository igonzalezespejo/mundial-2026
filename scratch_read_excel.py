import pandas as pd
import json

file_path = "c:/Users/israelg/OneDrive - abunayyangroup.com/98. Personal/37. Porra mundial web/data_raw/PORRAS_Combinadas - copia.xlsx"

try:
    xl = pd.ExcelFile(file_path)
    sheets = xl.sheet_names
    
    output = {
        "sheets": sheets,
        "samples": {}
    }
    
    # Read first 10 rows of "Resumen", "Resultados", "Evolucion_Puntos", "Evolucion_Ranking"
    for sheet in ["Resumen", "Resultados", "Evolucion_Puntos", "Evolucion_Ranking"]:
        if sheet in sheets:
            df = xl.parse(sheet, nrows=10)
            output["samples"][sheet] = df.to_json(orient="records")
            
    # Read first 10 rows of the first participant sheet (assuming the 5th sheet is a participant)
    if len(sheets) > 4:
        participant_sheet = sheets[4]
        df = xl.parse(participant_sheet, nrows=30)
        output["samples"][participant_sheet] = df.to_json(orient="records")
        
    print(json.dumps(output, indent=2))
except Exception as e:
    print(f"Error: {e}")
