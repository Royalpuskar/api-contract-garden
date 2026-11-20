export const sample = {
  "before": [
    {
      "route": "GET /notes",
      "fields": {
        "title": "string",
        "id": "number"
      },
      "required": [
        "id"
      ]
    }
  ],
  "after": [
    {
      "route": "GET /notes",
      "fields": {
        "title": "string",
        "id": "string",
        "owner": "string"
      },
      "required": [
        "id",
        "owner"
      ]
    }
  ]
};
