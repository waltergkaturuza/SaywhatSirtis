-- Check the actual content of the Results Framework for Community Water Program
-- This will show us what indicators exist in the project

SELECT 
    id,
    name,
    "resultsFramework",
    jsonb_pretty("resultsFramework") as pretty_framework
FROM projects 
WHERE id = '85764a19-3e31-4a54-8e5b-fbca45f2f560';

-- Also check the structure of objectives, outcomes, and indicators
SELECT 
    id,
    name,
    "resultsFramework"->'objectives' as objectives,
    jsonb_array_length("resultsFramework"->'objectives') as objectives_count,
    "resultsFramework"->'projectDuration' as project_duration
FROM projects 
WHERE id = '85764a19-3e31-4a54-8e5b-fbca45f2f560';

-- Check if there are any indicators nested in the objectives/outcomes/outputs
SELECT 
    id,
    name,
    jsonb_path_query_array("resultsFramework", '$.objectives[*].outcomes[*].indicators[*]') as outcome_indicators,
    jsonb_path_query_array("resultsFramework", '$.objectives[*].outcomes[*].outputs[*].indicators[*]') as output_indicators
FROM projects 
WHERE id = '85764a19-3e31-4a54-8e5b-fbca45f2f560';
