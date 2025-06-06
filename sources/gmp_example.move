module gmp_example::gmp;

use axelar_gateway::channel::{Self, Channel, ApprovedMessage};
use axelar_gateway::gateway::{Self, Gateway};
use gas_service::gas_service::GasService;
use relayer_discovery::discovery::RelayerDiscovery;
use relayer_discovery::transaction;
use std::ascii::{Self, String};
use std::type_name;
use sui::address;
use sui::coin::Coin;
use sui::event;
use sui::hex;
use sui::sui::SUI;

public struct Singleton has key {
    id: object::UID,
    channel: Channel,
}

public struct Executed has copy, drop {
    data: vector<u8>,
}

fun init(ctx: &mut TxContext) {
    let singletonId = object::new(ctx);
    let channel = channel::new(ctx);
    transfer::share_object(Singleton {
        id: singletonId,
        channel,
    });
}

//1. pass in objectId of relayer discovery
//2. pass in singleton hex was created in init
public fun register_transaction(discovery: &mut RelayerDiscovery, singleton: &Singleton) {
    let arguments = vector[
        vector[2u8],
        concat(vector[0u8], object::id_address(singleton).to_bytes()),
    ];

    let transaction = transaction::new_transaction(
        true,
        vector[
            transaction::new_move_call(
                transaction::new_function(
                    address::from_bytes(
                        hex::decode(
                            *ascii::as_bytes(
                                &type_name::get_address(
                                    &type_name::get<Singleton>(),
                                ),
                            ),
                        ),
                    ),
                    ascii::string(b"gmp"),
                    ascii::string(b"execute"),
                ),
                arguments,
                vector[],
            ),
        ],
    );
    discovery.register_transaction(&singleton.channel, transaction);
}

public fun send_call(
    singleton: &Singleton,
    gateway: &Gateway,
    gas_service: &mut GasService,
    destination_chain: String,
    destination_address: String,
    payload: vector<u8>,
    refund_address: address,
    coin: Coin<SUI>,
    params: vector<u8>,
) {
    let message_ticket = gateway::prepare_message(
        &singleton.channel,
        destination_chain,
        destination_address,
        payload,
    );

    gas_service.pay_gas(
        &message_ticket,
        coin,
        refund_address,
        params,
    );

    gateway.send_message(message_ticket);
}


//send msg to channel from avalanche (channel = dest addr)
public fun execute(call: ApprovedMessage, singleton: &mut Singleton) {
    let (_, _, _, payload) = singleton.channel.consume_approved_message(call);
    event::emit(Executed { data: payload });
}

fun concat<T: copy>(v1: vector<T>, v2: vector<T>): vector<T> {
    let mut result = v1;
    result.append(v2);
    result
}
