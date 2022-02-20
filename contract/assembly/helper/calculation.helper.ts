import { u128 } from "near-sdk-as";

export const NEAR_YOCTO = "1000000000000000000000000";
export const NEAR_FEE_PER_BYTE = "10000000000000000000";

export function calStorageFee(key: string, value: string): u128 {
    let num_of_byte: i32 = String.UTF8.byteLength(key) + 10 + String.UTF8.byteLength(value);
    let fee: u128 = u128.mul(u128.from(num_of_byte), u128.from(NEAR_FEE_PER_BYTE));
    return fee;
}

export class ComponentFee {
    id: string;
    value: u128;
}