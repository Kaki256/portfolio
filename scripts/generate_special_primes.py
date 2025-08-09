import json

def sieve_of_eratosthenes(limit):
    """エラトステネスの篩を用いて、指定された数までの素数を生成する"""
    primes = []
    is_prime = [True] * (limit + 1)
    is_prime[0] = is_prime[1] = False
    for p in range(2, limit + 1):
        if is_prime[p]:
            primes.append(p)
            for multiple in range(p * p, limit + 1, p):
                is_prime[multiple] = False
    return primes, set(primes)

def find_twin_primes(primes_set):
    """双子素数を見つける"""
    twins = set()
    for p in primes_set:
        if p + 2 in primes_set:
            twins.add(p)
            twins.add(p + 2)
    return sorted(list(twins))

def find_mersenne_primes(primes, primes_set, limit):
    """メルセンヌ素数を見つける (2^p - 1)"""
    mersennes = []
    for p in primes:
        m = 2**p - 1
        if m > limit:
            break
        if m in primes_set:
            mersennes.append(m)
    return mersennes

def find_emirps(primes_set):
    """エマープ（逆から読んでも異なる素数になる数）を見つける"""
    emirps = set()
    for p in primes_set:
        s_p = str(p)
        if s_p == s_p[::-1]:  # 回文素数は除く
            continue
        
        rev_p = int(s_p[::-1])
        if rev_p in primes_set:
            emirps.add(p)
            emirps.add(rev_p)
            
    return sorted(list(emirps))

def find_palindromic_primes(primes_set):
    """回文素数を見つける"""
    palindromes = []
    for p in primes_set:
        if p > 10 and str(p) == str(p)[::-1]:
            palindromes.append(p)
    return palindromes

def main():
    """メイン関数"""
    LIMIT = 5000
    
    primes, primes_set = sieve_of_eratosthenes(LIMIT)
    
    special_primes = {
        "twin_primes": find_twin_primes(primes_set),
        "mersenne_primes": find_mersenne_primes(primes, primes_set, LIMIT),
        "emirps": find_emirps(primes_set),
        "palindromic_primes": find_palindromic_primes(primes_set)
    }
    
    # 結果をJSON形式で出力
    print(json.dumps(special_primes, indent=2))

if __name__ == "__main__":
    main()
