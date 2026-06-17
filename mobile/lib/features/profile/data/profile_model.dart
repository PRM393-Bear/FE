class AddressModel {
  final String label;
  final String address;
  final bool isDefault;

  const AddressModel({
    required this.label,
    required this.address,
    this.isDefault = false,
  });

  AddressModel copyWith({
    String? label,
    String? address,
    bool? isDefault,
  }) {
    return AddressModel(
      label: label ?? this.label,
      address: address ?? this.address,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}

class ProfileModel {
  final String name;
  final String phone;
  final String email;
  final String bio;
  final double rating;
  final int ratingCount;
  final int sold;
  final int bought;
  final int donated;
  final List<AddressModel> addresses;
  final String avatarUrl;
  final String coverUrl;

  const ProfileModel({
    required this.name,
    required this.phone,
    required this.email,
    required this.bio,
    required this.rating,
    required this.ratingCount,
    required this.sold,
    required this.bought,
    required this.donated,
    required this.addresses,
    this.avatarUrl = '',
    this.coverUrl = '',
  });

  ProfileModel copyWith({
    String? name,
    String? phone,
    String? email,
    String? bio,
    double? rating,
    int? ratingCount,
    int? sold,
    int? bought,
    int? donated,
    List<AddressModel>? addresses,
    String? avatarUrl,
    String? coverUrl,
  }) {
    return ProfileModel(
      name: name ?? this.name,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      bio: bio ?? this.bio,
      rating: rating ?? this.rating,
      ratingCount: ratingCount ?? this.ratingCount,
      sold: sold ?? this.sold,
      bought: bought ?? this.bought,
      donated: donated ?? this.donated,
      addresses: addresses ?? this.addresses,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      coverUrl: coverUrl ?? this.coverUrl,
    );
  }
}