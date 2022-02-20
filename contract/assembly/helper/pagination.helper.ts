export const PAGE_SIZE = 5;

@nearBindgen
export class PaginationResult<T> {
    constructor(public page: i32, public total: i32, public data: T[]) {}
}

export class PaginationOffset {
    constructor(public startIndex: i32, public endIndex: i32) {}
}

export function pagination<T>(args: T[], page: i32): PaginationResult<T> {
    //by default minimum page = 1
    if (page < 1) {
        page = 1;
    }

    let maxPage = 0;
    if (args.length % PAGE_SIZE === 0) {
        maxPage = args.length / PAGE_SIZE;
    } else {
        maxPage = floor(args.length / PAGE_SIZE) + 1;
    }

    if (page > maxPage) {
        page = max(1, maxPage);
    }

    const startIndex = min(args.length - 1, args.length - (page - 1) * PAGE_SIZE - 1);
    const endIndex = max(0, startIndex - PAGE_SIZE + 1);

    let resultDatas = new Set<T>();
    for (let i = startIndex; i >= endIndex; i--) {
        resultDatas.add(args[i]);
    }
    return new PaginationResult(page, args.length, resultDatas.values());
}

export function getPaginationOffset(array_size: i32, page: i32): PaginationOffset {
    if (page < 1) {
        page = 1;
    }

    let maxPage = 0;
    if (array_size % PAGE_SIZE === 0) {
        maxPage = array_size / PAGE_SIZE;
    } else {
        maxPage = floor(array_size / PAGE_SIZE) + 1;
    }

    if (page > maxPage) {
        page = max(1, maxPage);
    }

    const startIndex = min(array_size - 1, array_size - (page - 1) * PAGE_SIZE - 1);
    const endIndex = max(0, startIndex - PAGE_SIZE + 1);

    return new PaginationOffset(startIndex, endIndex);
}
