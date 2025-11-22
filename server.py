import http.server
import socketserver
import json
import csv
import os
import datetime
from urllib.parse import unquote

PORT = 8000
DATA_DIR = os.path.join(os.getcwd(), 'data', 'students')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/submit-survey':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                
                # Generate filename
                fullname = data.get('fullName', 'anonymous').replace(' ', '_')
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"student_{fullname}_{timestamp}.csv"
                filepath = os.path.join(DATA_DIR, filename)
                
                # Define CSV columns based on requirements
                fieldnames = [
                    'fullName', 'age', 'gender', 'schoolName', 'region', 
                    'economicSituation', 'educationLevel', 'satisfaction', 
                    'tutoring', 'tutoringHours', 'problems', 'safety', 
                    'futurePrep', 'changes'
                ]
                
                # Write to CSV
                with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    writer.writeheader()
                    
                    # Flatten 'problems' list to string if necessary
                    row_data = data.copy()
                    if isinstance(row_data.get('problems'), list):
                        row_data['problems'] = '; '.join(row_data['problems'])
                        
                    writer.writerow(row_data)
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {'status': 'success', 'message': 'Survey saved successfully', 'file': filename}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                print(f"Saved survey to {filepath}")
                
            except Exception as e:
                print(f"Error saving survey: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {'status': 'error', 'message': str(e)}
                self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_error(404, "File not found")

print(f"Serving at port {PORT}")
print(f"Data directory: {DATA_DIR}")

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
