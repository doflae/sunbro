package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.BoardThumbnail;

import java.util.List;

public interface RankingService {
    String RANKING_GETTING_KEY = "ranking:get";

    List<BoardThumbnail> getRanking(RankingType type);
}
