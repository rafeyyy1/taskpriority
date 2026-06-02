import numpy as np

def calculate_ahp_weights():
    # Matrix criteria: C1(Deadline), C2(Bobot), C3(Kesulitan), C4(Tipe)
    # Target weights: 35%, 30%, 20%, 15%
    
    # Pairwise comparison matrix
    matrix = np.array([
        [1.0, 1.0, 2.0, 3.0],
        [1.0, 1.0, 1.0, 2.0],
        [0.5, 1.0, 1.0, 1.0],
        [0.333, 0.5, 1.0, 1.0]
    ])
    
    # Normalize the matrix
    col_sums = matrix.sum(axis=0)
    normalized_matrix = matrix / col_sums
    
    # Calculate weights (row averages)
    weights = normalized_matrix.mean(axis=1)
    
    # Calculate Consistency Ratio (CR)
    # Calculate weighted sum vector
    weighted_sum = np.dot(matrix, weights)
    
    # Calculate lambda max
    lambda_max = np.mean(weighted_sum / weights)
    
    n = 4
    # Consistency Index
    ci = (lambda_max - n) / (n - 1)
    
    # Random Index for n=4 is 0.90
    ri = 0.90
    
    cr = ci / ri if ri != 0 else 0
    is_consistent = cr < 0.1
    
    return {
        "matrix": matrix.tolist(),
        "normalized": normalized_matrix.tolist(),
        "weights": {
            "deadline": round(weights[0] * 100, 2),
            "bobot": round(weights[1] * 100, 2),
            "kesulitan": round(weights[2] * 100, 2),
            "tipe": round(weights[3] * 100, 2)
        },
        "cr": round(cr, 4),
        "is_consistent": bool(is_consistent)
    }
