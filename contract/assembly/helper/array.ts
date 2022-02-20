export function eq_array<T>(as: Set<T>, bs: Set<T>): bool {
    const as_size = as.size;
    const bs_size = bs.size;
    if (as_size != bs_size) {
        return false;
    }

    const as_array = as.values();
    const bs_array = bs.values();

    for (let i = 0; i < as_size; i++) {
        if (bs_array.indexOf(as_array[i]) == -1) {
            return false;
        }
    }

    return true;
}
