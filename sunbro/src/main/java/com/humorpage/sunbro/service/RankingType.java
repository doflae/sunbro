package com.humorpage.sunbro.service;

public enum RankingType {
    DAY(1),WEEK(7),MONTH(30);

    private final int value;

    RankingType(int value){this.value = value;}

    public int getValue(){return value;}
}
