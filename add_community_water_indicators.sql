-- Add comprehensive Results Framework data for Community Water Program
-- This will populate the project with realistic water program indicators

UPDATE projects 
SET "resultsFramework" = '{
  "objectives": [
    {
      "id": "obj_water_access_2024",
      "title": "Improve Water Access and Quality",
      "description": "Increase access to clean, safe water for rural communities across Zimbabwe",
      "isExpanded": true,
      "outcomes": [
        {
          "id": "outcome_water_access",
          "title": "Increased Access to Clean Water",
          "description": "More communities have access to clean, safe water sources",
          "isExpanded": true,
          "indicators": [
            {
              "id": "ind_water_access_1",
              "description": "Number of people with access to clean water",
              "baseline": "0",
              "baselineUnit": "people",
              "targets": {
                "Year1": "50000",
                "Year2": "100000",
                "Year3": "150000"
              },
              "targetUnit": "people",
              "monitoringMethod": "Household surveys and water point mapping",
              "dataCollection": {
                "frequency": "quarterly",
                "source": "Community health workers and water committees",
                "disaggregation": "Gender, Age, Location"
              },
              "comment": "Track both direct and indirect beneficiaries"
            },
            {
              "id": "ind_water_access_2",
              "description": "Percentage of target communities with improved water access",
              "baseline": "0",
              "baselineUnit": "%",
              "targets": {
                "Year1": "25",
                "Year2": "50",
                "Year3": "75"
              },
              "targetUnit": "%",
              "monitoringMethod": "Community assessments and water point functionality tests",
              "dataCollection": {
                "frequency": "semi-annually",
                "source": "District water officers and community leaders",
                "disaggregation": "Location, Community type"
              },
              "comment": "Measure functionality and sustainability of water points"
            }
          ],
          "outputs": [
            {
              "id": "output_boreholes",
              "title": "Boreholes Drilled and Equipped",
              "description": "New boreholes drilled and equipped with hand pumps",
              "isExpanded": true,
              "indicators": [
                {
                  "id": "ind_boreholes_1",
                  "description": "Number of boreholes drilled",
                  "baseline": "0",
                  "baselineUnit": "boreholes",
                  "targets": {
                    "Year1": "200",
                    "Year2": "400",
                    "Year3": "600"
                  },
                  "targetUnit": "boreholes",
                  "monitoringMethod": "Construction reports and site visits",
                  "dataCollection": {
                    "frequency": "monthly",
                    "source": "Construction contractors and engineers",
                    "disaggregation": "Province, District"
                  },
                  "comment": "Track drilling progress and completion"
                },
                {
                  "id": "ind_boreholes_2",
                  "description": "Number of boreholes equipped with hand pumps",
                  "baseline": "0",
                  "baselineUnit": "boreholes",
                  "targets": {
                    "Year1": "180",
                    "Year2": "360",
                    "Year3": "540"
                  },
                  "targetUnit": "boreholes",
                  "monitoringMethod": "Installation reports and functionality tests",
                  "dataCollection": {
                    "frequency": "monthly",
                    "source": "Installation teams and maintenance crews",
                    "disaggregation": "Province, District"
                  },
                  "comment": "Track equipment installation and functionality"
                }
              ]
            },
            {
              "id": "output_water_quality",
              "title": "Water Quality Testing and Treatment",
              "description": "Water quality testing and treatment systems implemented",
              "isExpanded": true,
              "indicators": [
                {
                  "id": "ind_water_quality_1",
                  "description": "Number of water quality tests conducted",
                  "baseline": "0",
                  "baselineUnit": "tests",
                  "targets": {
                    "Year1": "500",
                    "Year2": "1000",
                    "Year3": "1500"
                  },
                  "targetUnit": "tests",
                  "monitoringMethod": "Laboratory test reports and field testing",
                  "dataCollection": {
                    "frequency": "monthly",
                    "source": "Water quality technicians and laboratories",
                    "disaggregation": "Province, Water source type"
                  },
                  "comment": "Track both chemical and bacteriological testing"
                },
                {
                  "id": "ind_water_quality_2",
                  "description": "Percentage of water sources meeting WHO standards",
                  "baseline": "0",
                  "baselineUnit": "%",
                  "targets": {
                    "Year1": "60",
                    "Year2": "75",
                    "Year3": "90"
                  },
                  "targetUnit": "%",
                  "monitoringMethod": "Laboratory analysis and compliance reports",
                  "dataCollection": {
                    "frequency": "quarterly",
                    "source": "Certified laboratories and health departments",
                    "disaggregation": "Province, Water source type"
                  },
                  "comment": "Track compliance with WHO drinking water standards"
                }
              ]
            },
            {
              "id": "output_community_training",
              "title": "Community Training and Capacity Building",
              "description": "Training programs for water management and maintenance",
              "isExpanded": true,
              "indicators": [
                {
                  "id": "ind_training_1",
                  "description": "Number of community members trained in water management",
                  "baseline": "0",
                  "baselineUnit": "people",
                  "targets": {
                    "Year1": "500",
                    "Year2": "1000",
                    "Year3": "1500"
                  },
                  "targetUnit": "people",
                  "monitoringMethod": "Training attendance records and certificates",
                  "dataCollection": {
                    "frequency": "monthly",
                    "source": "Training facilitators and community leaders",
                    "disaggregation": "Gender, Age, Community"
                  },
                  "comment": "Track both men and women participation in training"
                },
                {
                  "id": "ind_training_2",
                  "description": "Number of water management committees established",
                  "baseline": "0",
                  "baselineUnit": "committees",
                  "targets": {
                    "Year1": "50",
                    "Year2": "100",
                    "Year3": "150"
                  },
                  "targetUnit": "committees",
                  "monitoringMethod": "Committee formation reports and meeting records",
                  "dataCollection": {
                    "frequency": "quarterly",
                    "source": "Community development officers and local leaders",
                    "disaggregation": "Province, Community size"
                  },
                  "comment": "Track establishment and functionality of water committees"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "projectDuration": 3
}'::jsonb
WHERE id = '85764a19-3e31-4a54-8e5b-fbca45f2f560';

-- Verify the update was successful
SELECT 
    id,
    name,
    "resultsFramework"->'objectives' as objectives,
    jsonb_array_length("resultsFramework"->'objectives') as objectives_count,
    "resultsFramework"->'projectDuration' as project_duration
FROM projects 
WHERE id = '85764a19-3e31-4a54-8e5b-fbca45f2f560';

-- Check the indicators that should now be available
SELECT 
    id,
    name,
    jsonb_path_query_array("resultsFramework", '$.objectives[*].outcomes[*].indicators[*]') as outcome_indicators,
    jsonb_path_query_array("resultsFramework", '$.objectives[*].outcomes[*].outputs[*].indicators[*]') as output_indicators
FROM projects 
WHERE id = '85764a19-3e31-4a54-8e5b-fbca45f2f560';
